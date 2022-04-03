import * as vl from "vega-lite-api";

export default class Demographics {

    render_demographics(data) {
        vl
        .markRect()
        .data(data)
        .encode(
            vl.y({"aggregate": "count"}).title("Amount of Athletes"),
            vl.x().fieldO("Year_City").title("Games"),
            //vl.color({"aggregate": "count"}).title("Amount of Athletes")
        )
        .title("Amount of Athletes by Games")
        .render()
        .then(viewElement => {
            // render returns a promise to a DOM element containing the chart
            // viewElement.value contains the Vega View object instance
            document.getElementById('view').appendChild(viewElement);
        });
    }

    render_gender(data){
        vl
        .markBar()
        .data(data)
        .encode(
            vl.y({"aggregate": "count", "stack":  "normalize"}).title("Athletes"),
            vl.x().fieldO("Year_City").title("Games"),
            vl.color({"scale": {
                "domain": ["M", "F"],
                "range": ["#3c36f5", "#ff73cc"]
              }}).fieldN("Sex").title("Gender")
        )
        .title("Amount of Athletes by Gender")
        .render()
        .then(viewElement => {
            // render returns a promise to a DOM element containing the chart
            // viewElement.value contains the Vega View object instance
            document.getElementById('view').appendChild(viewElement);
        });
    }
}