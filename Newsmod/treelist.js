/**
 * Implements a simple layout for rendering trees in a list style view as seen in file system browsers
 * @author Patrick Oladimeji
 * @date 5/24/14 12:21:50 PM
 */
/* Copyright 2014 Patrick Oladimeji
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
/*jshint unused: true, undef: true*/
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global d3*/
(function (d3) {
    d3.layout.treelist = function () {
        "use strict";
        var hierarchy = d3.layout.hierarchy().sort(null).value(null),
            nodeHeight = 20,
            childIndent = 20,
            size;

        var treelist = function (d, i) {
            var nodes = hierarchy.call(this, d, i),
                root = nodes[0];

            function visit(f, t, index, parent) {
                if (t) {
                    f(t, index, parent);
                }
                var children = t.children;
                if (children && children.length) {
                    children.forEach(function (child, ci) {
                        visit(f, child, ci, t);
                    });
                }
            }

            /**
             visit all nodes in the tree and set the x, y positions
            */
            function layout(node) {
                //all children of the same parent are rendered on the same  x level
                //y increases every time a child is added to the list
                var x = 0, y = 0;
                visit(function (n, index, parent) {
                    x = parent ? parent.x + childIndent : 0;
                    y = y + nodeHeight;
                    n.y = y;
                    n.x = x;

                }, node);
                //update size after visiting
                size = [x, y];
            }

            layout(root);
            return nodes;
        };

        treelist.size = function () {
            return size;
        };

        treelist.nodeHeight = function (d) {
            if (arguments.length) {
                nodeHeight = d;
                return treelist;
            }
            return nodeHeight;
        };

        treelist.childIndent = function (d) {
            if (arguments.length) {
                childIndent = d;
                return treelist;
            }
            return childIndent;
        };

        treelist.nodes = treelist;

        return treelist;
    };

}(d3));
