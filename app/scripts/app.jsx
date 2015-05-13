import React from 'react'
import Main from './components/main.jsx'

window.React = React;

var Header = React.createClass({
  render: function() {
    return ( `
      <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
      <link href="http://handsontable.com//styles/main.css" rel="stylesheet">
      <link href="http://handsontable.com//bower_components/handsontable/dist/handsontable.full.min.css" rel="stylesheet">
      <script src="http://handsontable.com//bower_components/handsontable/dist/handsontable.full.min.js"></script>
      <script src="http://handsontable.com//bower_components/ruleJS/dist/full/ruleJS.all.full.js"></script>
      <script src="http://handsontable.com//bower_components/handsontable-ruleJS/src/handsontable.formula.js"></script>

      <style type="text/css">
      body {background: white; margin: 20px;}
      h2 {margin: 20px 0;}
      </style> `
    );
  }
});

//React.render(<Header/>, document.head );
React.render(<Main/>, document.body);
