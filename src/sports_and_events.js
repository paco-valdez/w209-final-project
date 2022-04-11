import * as d3 from "d3";

export default class SportsAndEvents {
    render_sports_and_events(userData, scroller) {
        let e = document.getElementById("firstGame");
        let first_game = e.options[e.selectedIndex].value;
        e = document.getElementById("secondGame");
        let second_game = e.options[e.selectedIndex].value;
        let userDataSecond = userData.filter((d) => +d.Year === +second_game.slice(0, 4))
        let userDataFirst = userData.filter((d) => +d.Year === +first_game.slice(0, 4))
        let eventsFirst = first_game ? [...new Set(userDataFirst.map(d => d.Event))] : []
        let eventsSecond = second_game ? [...new Set(userDataSecond.map(d => d.Event))] : []
        let addedEvents = eventsSecond.filter(function (e) {
            return this.indexOf(e) < 0;
            }, eventsFirst)
        let removedEvents = eventsFirst.filter(function (e) {
            return this.indexOf(e) < 0;
            }, eventsSecond)
        let addedEventsData = [];
        for (let i = 0; i < userDataSecond.length; i++) {
            if (addedEvents.includes(userDataSecond[i].Event)) {
              addedEventsData.push(userDataSecond[i]);
            }
        }
        let removedEventsData = [];
        for (let i = 0; i < userDataFirst.length; i++) {
            if (removedEvents.includes(userDataFirst[i].Event)) {
              removedEventsData.push(userDataFirst[i]);
            }
        }

        let groupedChartData = d3.rollup(
            addedEventsData,
            (v) => v.length,
            (d) => d.Sport,
            (d) => d.Event
        );
        let root = d3.hierarchy(groupedChartData);
        let verticalSeparationBetweenNodes = 250;
        let horizontalSeparationBetweenNodes = 6;
        let nodeWidth = 10;
        let nodeHeight = 0;
        let width = 750;
        let dx = 20;
        let dy = width / 6.0;
        let margin2 = ({ top: 10, right: 140, bottom: 10, left: 140 });
        let layTree = d3
          .tree()
          .size([width, dx])
          .nodeSize([
            nodeWidth + horizontalSeparationBetweenNodes,
            nodeHeight + verticalSeparationBetweenNodes
          ])
          .separation(function (a, b) {
            return a.parent == b.parent ? 1 : 1.25;
          })

        let layedTree = layTree(root);

        root.descendants()[0].data[0] = "Added";

        root.x0 = dy / 2;
        root.y0 = 0;

        let svg = d3
        .create("svg")
        .attr("viewBox", [-margin2.left, -margin2.top, width, dx])
        .style("font", "30px sans-serif")
        .style("user-select", "none");

        let left = root;
        let right = root;
        root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
        });

        let height = right.x - left.x + margin2.top + margin2.bottom;

        let transition = svg
            .transition()
            .duration(1000)
            .attr("viewBox", [-margin2.left, left.x - margin2.top, width, height])
            .tween(
              "resize",
              window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
            );

        svg
        .selectAll(".link")
        .data(layedTree.links())
        .join("path")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-opacity", 0.5);

        svg
        .selectAll(".node")
        .data(layedTree)
        .join("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
        .call((g) => g.append("circle").attr("r", 2.5).attr("fill", "steelblue"))
        .call((g) =>
          g
            .append("text")
            .attr("dy", "0.61em")
            .attr("x", (d) => (d.children ? -6 : 6))
            .attr("text-anchor", (d) => (d.children ? "end" : "start"))
            .text((d) => d.data[0])
            .clone(true)
            .lower()
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .attr("stroke", "white")
        );

        const svg_title = d3.create("svg").attr("viewBox", [0, 0, width, 20]);

        let g = svg_title.append("g");

        g.append("g")
            .attr("class", "sport")
            .append("text")
            .attr("x", margin2.left * 5.3)
            .attr("y", 10 + margin2.top / 2)
            .text("Added Sports")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");

        g.append("g")
            .attr("class", "event")
            .append("text")
            .attr("x", margin2.left * 9.7)
            .attr("y", 10 + margin2.top / 2)
            .text("Added Events")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");

        let newDiv = document.createElement("div");
        newDiv.appendChild(svg_title.node());
        newDiv.setAttribute('id', 'path-titles')
        document.getElementById('view-3').appendChild(newDiv);
        newDiv = document.createElement("div");
        newDiv.setAttribute('id', 'paths')
        newDiv.appendChild(svg.node());
        document.getElementById('view-3').appendChild(newDiv);

        const svg_title_removed = d3.create("svg").attr("viewBox", [0, 0, width, 20]);

        g = svg_title_removed.append("g");

        g.append("g")
            .attr("class", "sport")
            .append("text")
            .attr("x", margin2.left * 5.3)
            .attr("y", 10 + margin2.top / 2)
            .text("Removed Sports")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");

        g.append("g")
            .attr("class", "event")
            .append("text")
            .attr("x", margin2.left * 9.7)
            .attr("y", 10 + margin2.top / 2)
            .text("Removed Events")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");

        newDiv = document.createElement("div");
        newDiv.setAttribute('id', 'path-titles-removed')
        newDiv.appendChild(svg_title_removed.node());
        document.getElementById('view-3').appendChild(newDiv);

        groupedChartData = d3.rollup(
            removedEventsData,
            (v) => v.length,
            (d) => d.Sport,
            (d) => d.Event
        );
        root = d3.hierarchy(groupedChartData);
        layedTree = layTree(root);

        root.descendants()[0].data[0] = "Removed";

        root.x0 = dy / 2;
        root.y0 = 0;

        svg = d3
            .create("svg")
            .attr("viewBox", [-margin2.left, -margin2.top, width, dx])
            .style("font", "30px sans-serif")
            .style("user-select", "none");

        left = root;
        right = root;
        root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
        });

        height = right.x - left.x + margin2.top + margin2.bottom;

        transition = svg
            .transition()
            .duration(1000)
            .attr("viewBox", [-margin2.left, left.x - margin2.top, width, height])
            .tween(
              "resize",
              window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
        );

        svg
            .selectAll(".link")
            .data(layedTree.links())
            .join("path")
            .attr("class", "link")
            .attr(
              "d",
              d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x)
            )
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-opacity", 0.5);

        svg
            .selectAll(".node")
            .data(layedTree)
            .join("g")
            .attr("class", "node")
            .attr("transform", (d) => `translate(${d.y}, ${d.x})`)
            .call((g) => g.append("circle").attr("r", 2.5).attr("fill", "orange"))
            .call((g) =>
              g
                .append("text")
                .attr("dy", "0.61em")
                .attr("x", (d) => (d.children ? -6 : 6))
                .attr("text-anchor", (d) => (d.children ? "end" : "start"))
                .text((d) => d.data[0])
                .clone(true)
                .lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white")
            );
        newDiv = document.createElement("div");
        newDiv.setAttribute('id', 'paths-removed')
        newDiv.appendChild(svg.node());
        document.getElementById('view-3').appendChild(newDiv);
        }
}