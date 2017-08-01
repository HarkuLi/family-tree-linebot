const dbop = require("../dbop");

var srcId = "Ubd390b9ab997142a8449926989667617";

dbop.colleMapDelete(srcId)
    .then((rst) => {
      console.log("count: "+rst.deletedCount);
    });