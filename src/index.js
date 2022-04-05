import * as d3 from "d3";
import * as scrollama from "scrollama";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import * as vegaTooltip from "vega-tooltip";
import * as vl from "vega-lite-api";
import './style.css';
import Demographics from './demographics.js';


// using d3 for convenience
const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const article = scrolly.select("article");
const step = article.selectAll(".step");

// initialize the scrollama
const scroller = scrollama();

// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    let stepH = Math.floor(window.innerHeight * 0.75);
    step.style("height", stepH + "px");

    let figureHeight = window.innerHeight / 2;
    let figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
    console.log(response);
    // response = { element, direction, index }

    // add color to current step only
    step.classed("is-active", function (d, i) {
        return i === response.index;
    });

    // update graphic based on step
    let chart_key = "chart_" + (response.index + 1);
    console.log(chart_key);
    let update_func = chart_map[chart_key];
    if (update_func !== undefined && data_ready && rendered_chart !== chart_key){
        console.log("Updating: update_func: " + (update_func !== undefined) + " data_ready:" + data_ready + " chart_key:" + chart_key);
        rendered_chart = chart_key;
        document.getElementById('view').innerHTML = '';
        update_func(filtered_data(raw_data));
    } else if (!data_ready || update_func === undefined){
        console.log("Wait: update_func: " + (update_func !== undefined) + " data_ready:" + data_ready + " chart_key:" + chart_key);
        document.getElementById('view').innerHTML = '';
        rendered_chart = null;
    } else {
        console.log("Nothing: update_func: " + (update_func !== undefined) + " data_ready:" + data_ready + " chart_key:" + chart_key);
        // rendered_chart = null;
    }


    // figure.select("p").text(response.index + 1);
}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
    });
}

function init() {
    setupStickyfill();

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    //         this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.33,
            debug: false
        })
        .onStepEnter(handleStepEnter);

    const options = {
        config: {
          // Vega-Lite default configuration
        },
        init: (view) => {
          // initialize tooltip handler
          view.tooltip(new vegaTooltip.Handler().call);
        },
        view: {
          // view constructor options
          // remove the loader if you don't want to default to vega-datasets!
          renderer: "canvas",
        },
      };

      // register vega and vega-lite with the API
      vl.register(vega, vegaLite, options);
}

function filtered_data(data){
    let e = document.getElementById("season");
    let season = e.options[e.selectedIndex].value;
    e = document.getElementById("firstGame");
    let first_game = e.options[e.selectedIndex].value;
    e = document.getElementById("secondGame");
    let second_game = e.options[e.selectedIndex].value;
    return data
        .filter(athlete => athlete.Season === season)
        .filter(athlete => athlete.Year_City >= first_game)
        .filter(athlete => athlete.Year_City <= second_game)
    ;
}

function populateSelect(select_id, values){
    let e = document.getElementById(select_id);
    e.innerHTML = '';
    for (let i = 0; i < values.length; i++){
        let opt = document.createElement('option');
        opt.value = values[i];
        opt.innerHTML = values[i];
        if(i===0){
            opt.selected = true;
        }
        e.appendChild(opt);
    }
    return e
}

function onUpdateSeason(){
    let e = document.getElementById("season");
    let season = e.options[e.selectedIndex].value;
    let userData = raw_data.filter(d => d.Season === season)
    let gamesUser = Array.from(new Set(userData.map((d) => d.Year_City))).sort(d3.ascending)
    let gamesUserFirst = gamesUser.slice(0, gamesUser.length - 1)
    let select = populateSelect("firstGame", gamesUserFirst);
    let first_game = select.options[select.selectedIndex].value;
    let gamesUserSecond = gamesUser.filter(
        (d) => d.slice(0, 4) > first_game.slice(0, 4)
    )
    populateSelect("secondGame", gamesUserSecond);
    renderSelectedChart();
}

function onUpdateFirstGame(){
    let e = document.getElementById("season");
    let season = e.options[e.selectedIndex].value;
    let userData = raw_data.filter(d => d.Season === season)
    let gamesUser = Array.from(new Set(userData.map((d) => d.Year_City))).sort(d3.ascending)
    let select = document.getElementById("firstGame");
    let first_game = select.options[select.selectedIndex].value;
    let gamesUserSecond = gamesUser.filter(
        (d) => d.slice(0, 4) > first_game.slice(0, 4)
    )
    populateSelect("secondGame", gamesUserSecond);
    renderSelectedChart();
}

function renderSelectedChart(){
    let update_func = chart_map[rendered_chart];
    document.getElementById('view').innerHTML = '';
    if (update_func !== undefined){
        update_func(filtered_data(raw_data));
    }
}

// kick things off
init();
let dem = new Demographics();

const chart_map = {
    chart_1: dem.render_demographics,
    chart_2: dem.render_gender
}

let data_ready = false;
let raw_data = null;
let rendered_chart = null;

d3.csv("https://raw.githubusercontent.com/pacofvf/w209-final-project/main/data/athletes_agg.csv").then(function(data) {
    let seasonUser = Array.from(new Set(data.map((d) => d.Season))).sort(
        d3.ascending
    )
    console.log(seasonUser);
    data_ready = true;

    raw_data = data.map(obj=> ({ ...obj, Year_City: obj.Year + ' ' + obj.City}));
    // dem.render_demographics(filtered_data(raw_data));
    rendered_chart = 'chart_1';

    let e = document.getElementById("season");
    e.addEventListener("change", function() {
        onUpdateSeason();
    });
    e = document.getElementById("firstGame");
    e.addEventListener("change", function() {
        onUpdateFirstGame();
    });
    e = document.getElementById("secondGame");
    e.addEventListener("change", function() {
        renderSelectedChart();
    });
    onUpdateSeason();
});

