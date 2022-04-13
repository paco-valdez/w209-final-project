import * as vl from "vega-lite-api";
import * as d3 from "d3";

export default class Newcomers {
    render_newcomers(data, scroller){
        console.log(data)
        vl
            .markPoint()
            .data(data)
            .encode(
                vl.x().fieldN('country').title('Country'),
                vl.y().fieldQ('medal').title('Medal Count'),
                vl.size().fieldQ('athlete')
            )
            .width(300)
            .height(300)
            .title('Number of Medals Won by Newcomer Countries')
            .render()
            .then(viewElement => {
                // render returns a promise to a DOM element containing the chart
                // viewElement.value contains the Vega View object instance
                document.getElementById('view-4').appendChild(viewElement);
            });
        let demographics = d3.select('newcomers')
        demographics.style("height", (window.innerHeight * 0.75) + "px");
    }
}