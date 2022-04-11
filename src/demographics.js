import * as vl from "vega-lite-api";
import * as d3 from "d3";

export default class Demographics {

    render_demographics(data, scroller) {
        vl
            .markRect({width: 10})
            .data(data)
            .encode(
                vl.y({"aggregate": "sum", "field": "Athletes"}).title("Number of athletes"),
                vl.x().fieldO("Year_City").title("Games"),
                //vl.color({"aggregate": "count"}).title("Amount of Athletes")
            )
            .title("Number of athletes that participated")
            .height(window.innerHeight * 0.5)
            .render()
            .then(viewElement => {
                // render returns a promise to a DOM element containing the chart
                // viewElement.value contains the Vega View object instance
                document.getElementById('view-1').appendChild(viewElement);
            });
        let demographics = d3.select('demographics')
        demographics.style("height", (window.innerHeight * 0.75) + "px");
        // scroller.resize();
    }

    render_gender(data, scroller){
        vl
            .markBar()
            .data(data)
            .encode(
                vl.y({"aggregate": "sum", "field": "Athletes", "stack":  "normalize"}).title("Athletes"),
                vl.x().fieldO("Year_City").title("Games"),
                vl.color({"scale": {
                    "domain": ["M", "F"],
                    "range": ["#3c36f5", "#ff73cc"]
                  }}).fieldN("Sex").title("Gender")
            )
            .title("Amount of Athletes by Gender")
            .height(window.innerHeight * 0.5)
            .render()
            .then(viewElement => {
                // render returns a promise to a DOM element containing the chart
                // viewElement.value contains the Vega View object instance
                document.getElementById('view-2').appendChild(viewElement);
            });
        let gender = d3.select('gender')
        gender.style("height", (window.innerHeight * 0.75) + "px");
        // scroller.resize();
    }
}