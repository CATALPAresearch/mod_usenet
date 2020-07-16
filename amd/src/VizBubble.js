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
                    const height = 350;
                    const width = 600;
                    const velocityDecay = 0.15;
                    const forceStrength = 0.03;

                    let nodes;
                    let bubbles;
                    let text;

                    let rawData = [];

                    d3.timeFormatDefaultLocale({
                        "decimal": ",",
                        "thousands": ".",
                        "grouping": [3],
                        "currency": ["€", ""],
                        "dateTime": "%a %b %e %X %Y",
                        "date": "%d.%m.%Y",
                        "time": "%H:%M:%S",
                        "periods": ["AM", "PM"],
                        "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
                        "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // need to be english in order to parse the server date
                        "months": ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                        "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] // english
                    });

                    var parseTime = d3.timeParse("%a, %e %b %Y %H:%M:%S %Z");
                    var parseTime2 = d3.timeParse("%a, %e %b %Y %H:%M:%S %Z (UTC)");

                    for (var i in this.treedata) {
                        this.treedata[i].count = this.treedata[i].children === undefined ? 10 : this.treedata[i].children.length * 10;
                        this.treedata[i].time = parseTime(this.treedata[i].date) || parseTime2(this.treedata[i].date);
                        if (this.treedata[i].time === null) {
                            console.log('warning: could not convert usenet date string into date object: ', this.treedata[i].date, this.treedata[i]);
                            continue;
                        }else{
                            this.treedata[i].id = i;
                            rawData.push(this.treedata[i]);
                        }
                    }
                    
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
                            id: d.id,
                            name: d.name,
                            date: d.time,
                            radius: radiusScale(d.count),
                            fill: colorScale(d.count),
                            x: Math.random() * width,
                            y: heightScale(d.count)/*  Math.random() * height */
                        }
                    })

                    /* console.log('node ', nodes);
                    console.log('data', rawData); */

                    nodes.sort((a, b) => b.date - a.date);

                    d3.select('#chart')
                        .append('svg')
                        .attr('height', height)
                        .attr('width', width)


                    bubbles = d3.select('#chart svg')
                        .selectAll('circle')
                        .data(nodes)
                        .enter()
                        .append('circle')
                        .attr('id', d => { return "circle-" + d.id })
                        .attr('r', d => { return d.radius })
                        .attr('fill', d => 'salmon')
                        .attr('stroke', d => { return d3.rgb('salmon').darker() })
                        .on('mouseover', onMouseOver)
                        .on('mouseout', onMouseOut)
                        //.call(d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded))
                        ;

                    text = d3.select('#chart svg')
                        .selectAll('text')
                        .data(nodes)
                        .enter()
                        .append('text')
                        .text(function (d) {
                            return d.name
                        })
                        .attr('color', 'black')
                        .attr('font-size', 8);


                    forceSimulation = d3.forceSimulation()
                        .nodes(nodes)
                        .velocityDecay(velocityDecay)
                        .on('tick', ticked)
                        .force('x', d3.forceX().strength(forceStrength).x(width / 2))
                        .force('y', d3.forceY().strength(forceStrength).y(height / 2))
                        .force("charge", d3.forceManyBody().strength(charge))

                    /**
                     * onMouseOver Event
                     * @param {} d 
                     * @todo
                     * - Anzahl involvierter Personen, anzahl an Betreuern
                     * - Anzahl Beiträge
                     * - mittlere Textlänge
                     * - Alter
                     * - letzter Beitrag
                     * - 
                     */
                    function onMouseOver(d, i) {
                        d3.select("#circle-" + d.id)
                            .attr('fill', 'red')
                            .attr('r', d.radius * 1.5)
                            ;
                        return;
                        // Specify where to put label of text
                        bubbles.append("text").attr({
                            id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
                            x: function () { return xScale(d.x) - 30; },
                            y: function () { return yScale(d.y) - 15; }
                        })
                            .text(function () {
                                return [d.x, d.y];  // Value of the text
                            });

                    }

                    function onMouseOut(d, i) {
                        d3.select("#circle-" + d.id)
                            .attr('fill', 'salmon')
                            .attr('r', d.radius)
                            ;
                        return;
                    }
                    
                    function dragStarted(d) {
                        console.log('start');
                        forceSimulation.alphaTarget(0.3).restart()
                    }
                    function dragged(d) {
                        console.log('drag');
                        //bubbles.attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y); 
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