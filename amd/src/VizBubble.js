define([
    'jquery',
    M.cfg.wwwroot + '/mod/newsmod/lib/build/vue.min.js',
    M.cfg.wwwroot + '/mod/newsmod/lib/src/d3.v5.js'
], function ($, Vue, d3) {


    return Vue.component('post',
        {
            props: ['treedata'],

            data: function () {
                return {
                    isSelected: false
                };
            },
            watch: {
                treedata: function () {
                    //console.log('bubble ', this.treedata);
                    this.createBubbleChart();
                }
            },
            mounted: function () {

            },
            methods: {
                createBubbleChart: function () {
                    const height = 300;
                    const width = 500;
                    const velocityDecay = 0.15;
                    const forceStrength = 0.03;

                    let nodes;
                    let bubbles;
                    let text;

                    let rawData = [];
                    for (var i in this.treedata) {
                        this.treedata[i].count = this.treedata[i].children === undefined ? 10 : this.treedata[i].children.length * 10;
                        rawData.push(this.treedata[i]);
                    }
                    console.log(rawData[1])
                    let forceSimulation;

                    let radiusScale;
                    let colorScale;
                    let heightScale;


                    radiusScale = d3.scaleLinear()
                        .domain([1, Math.max.apply(Math, rawData.map(a => a.count))])
                        .range([5, 40]);

                    colorScale = d3.scaleSequential()
                        .domain([0, 100])
                        .interpolator(d3.interpolateRainbow);

                    heightScale = d3.scaleLinear()
                        .domain([0, 100])
                        .range([0, height]);

                    nodes = rawData.map(d => {
                        return {
                            name: d.name,
                            radius: radiusScale(d.count),
                            fill: colorScale(d.count),
                            x: Math.random() * width,
                            y: heightScale(d.count)/*  Math.random() * height */
                        }
                    })

                    /* console.log('node ', nodes);
                    console.log('data', rawData); */

                    /* nodes.sort((a, b) => b.radius - a.radius) */

                    d3.select('#chart')
                        .append('svg')
                        .attr('height', height)
                        .attr('width', width)


                    bubbles = d3.select('#chart svg')
                        .selectAll('circle')
                        .data(nodes)
                        .enter()
                        .append('circle')
                        .attr('r', d => { return d.radius })
                        .attr('fill', d => 'salmon')
                        .attr('stroke', d => { return d3.rgb('salmon').darker() })
                        .call(d3.drag()
                            //.on('start', dragStarted)
                            //.on('drag', dragged)
                            //.on('end', dragEnded)
                        );

                    text = d3.select('#chart svg')
                        .selectAll('circle')
                        .data(nodes)
                        .enter()
                        .append('text')
                        .text(function(d){ 
                            console.log(d.name); 
                            return d.name })
                        .attr('color', 'black')
                        .attr('font-size', 15);


                    forceSimulation = d3.forceSimulation()
                        .nodes(nodes)
                        .velocityDecay(velocityDecay)
                        .on('tick', ticked)
                        .force('x', d3.forceX().strength(forceStrength).x(width / 2))
                        .force('y', d3.forceY().strength(forceStrength).y(height / 2))
                        .force("charge", d3.forceManyBody().strength(charge))


                    function dragStarted(d) {
                        console.log('start');
                        forceSimulation.alphaTarget(0.3).restart()
                    }
                    function dragged(d) {
                        console.log('drag');
                        /* bubbles.attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y); */
                        d.fx = d3.event.x
                        d.fy = d3.event.y
                    }

                    function dragEnded(d) {
                        console.log('end');
                        delete d.fx;
                        delete d.fy;
                        forceSimulation.alphaTarget(0);
                    }



                    function ticked() {
                        bubbles
                            .attr("cx", function (d) {
                                return d.x;
                            })
                            .attr("cy", function (d) {
                                return d.y;
                            });

                        text
                            .attr('x', (data) => {
                                return data.x
                            })
                            .attr('y', (data) => {
                                return data.y
                            });
                    }

                    function radius(d) {
                        return d.radius + 1
                    }

                    function charge(d) {
                        return -Math.pow(d.radius, 2) * forceStrength;
                    }

                }
            },

            template: `
                <div>
                    <div id="chart"></div>
                </div>
                `
        });
});