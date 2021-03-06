.<%=common %> {
  font-size: <%= baseSize %>px;
}

.<%=common %>::before {
  content: "";
  vertical-align: middle;
  display: inline-block;
  background-image: url("<%=svgPath%>");
  background-repeat: no-repeat;
  background-size: <%= relWidth %>em <%= relHeight %>em;
}

.no-svg .<%=common %>::before {
  content: none;
}
<% _.forEach(svg, (svgItem) => { %>
.<%=common %>.<%=common %>_<%=svgItem.name%>::before {
  background-position: <%= svgItem.relPositionX %>em <%= svgItem.relPositionY %>em;
  width: <%= svgItem.relWidth %>em;
  height: <%= svgItem.relHeight %>em;
}
<% }); %>
