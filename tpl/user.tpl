<html>
  <head>
    <style>
     ul {
         font-family: arial;
         font-size: 0.8em;
         list-style: none;
         padding-left: 10px;
         padding-top: 85px;
     }

     li {
         line-height: 21px;
         height: 21px;
     }

     .date {
         line-height: 24px;
         padding-left: 76px;
     }

     .id {
         padding-left: 28px;
     }
    </style>
  </head>
  <body onload="window.print()">
    <ul>
      <li class="title">
        {{title}}
      </li>
      <li class="name">
        {{name}}
      </li>
      <li class="date">
        {{currentDate}}
      </li>
      <li class="id">
        {{id}}
      </li>
    </ul>
  </body>
</html>
