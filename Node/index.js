// Put all onload AJAX calls here, and event listeners
$(document).ready(function() {
  var files = [];
  var filenameVar;
  var coords = [];

  var sortTable = function() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("gpxListTable");
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[3];
      y = rows[i + 1].getElementsByTagName("TD")[3];
      //check if the two rows should switch place:
      if (Number(x.innerHTML) > Number(y.innerHTML)) {
        //if so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

  var hideQueries = function () {
    $("#dispAllRoutesDiv").hide();
    $("#dispRouteFileDiv").hide();
    $("#dispPointRouteDiv").hide();
    $("#dispPointFileDiv").hide();
  }

  var repopulateGPXLog = function () {
    $("#gpxListTableBody").empty();
    $.ajax({
        type: 'get',            //Request type
        url: '/getRouteList',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          filename: $("#fileDropDown").val()
        },
        success: function (data) {
            //console.log(data);
            for (var i = 0; i < data.foo.length; i++) {
                var newElem = "<tr><td>Route " + (i+1) + "</td><td>" + data.foo[i]['name'] + "</td><td>" + data.foo[i]['numPoints'] + " </td><td>" + data.foo[i]['len'] + "</td><td>" + data.foo[i]['loop'] + "</td><td><button id='renameButton'>Rename</button></td><td><button id='showAttr'>Show Attr</button></td></tr>";
                $("#gpxListTableBody").append(newElem);
            }
            console.log("Succesfully populated routes");
            sortTable();
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to populate routes: " + error);
        }
    });
    $.ajax({
        type: 'get',            //Request type
        url: '/getTrackList',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          filename: $("#fileDropDown").val()
        },
        success: function (data) {
            //console.log(data);
            for (var i = 0; i < data.foo.length; i++) {
                var newElem = "<tr><td>Track " + (i+1) + "</td><td>" + data.foo[i]['name'] + "</td><td></td><td>" + data.foo[i]['len'] + "</td><td>" + data.foo[i]['loop'] + "</td><td><button id='renameButton'>Rename</button></td><td><button id='showAttr'>Show Attr</button></td></tr>";
                $("#gpxListTableBody").append(newElem);
                //console.log(data);
            }
            console.log("Succesfully populated tracks");
            sortTable();
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to populate tracks: " + error);
        }
    });
  };

  var repopulateFileLog = function() {
    $("#fileListTableBody").empty();
    $("#fileDropDown").empty();
    $("#fileDropDownRoute").empty();
    files = [];
    $.ajax({
        type: 'get',            //Request type
        url: '/getFileList',   //The server endpoint we are connecting to
        success: function (data) {
            console.log("Succesfully obtained file list");
            for (var i = 0; i < data.foo.length; i++) {
              if ((data.foo[i].substr(data.foo[i].length - 4)).toLowerCase() == ".gpx") {
                $.ajax({
                    type: 'get',            //Request type
                    url: '/getGPXFileData',   //The server endpoint we are connecting to
                    dataType: 'json',
                    data: {
                      filename: data.foo[i]
                    },
                    success: function (data) {
                        if (data.foo != null) {
                          files.push(data.foo['filename']);
                          $("#fileDropDown").append('<option value="' + data.foo['filename'] + '">' + data.foo['filename'] + '</option>');
                          $("#fileDropDownRoute").append('<option value="' + data.foo['filename'] + '">' + data.foo['filename'] + '</option>');
                          var newElem = "<tr><td><a href='" + "uploads/" + data.foo['filename'] + "'>" + data.foo['filename'] + "</a>" + "</td><td>" + data.foo['version'] + "</td>" + "</td><td>" + data.foo['creator'] + "</td>" + "</td><td>" + data.foo['numWaypoints'] + "</td>" + "</td><td>" + data.foo['numRoutes'] + "</td>" + "</td><td>" + data.foo['numTracks'] + "</td></tr>";
                          $("#fileListTableBody").append(newElem);
                          console.log("Succesfully obtained file data");
                        }
                    },
                    fail: function(error) {
                        // Non-200 return, do something with error
                        console.log("Failed to obtain file data: " + error);
                    }
                });
              }
            }
            //console.log(files);
            var fileExists = false;
            for (var k = 0; k < data.foo.length; k++) {
              if (((data.foo[k]).toLowerCase()).includes(".gpx")) {
                fileExists = true;
              }
            }
            if (!(fileExists)) {
                $("#fileListTableBody").append("<tr><td>No files</td></tr>");
            }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to obtain file list: " + error);
        }
    });

  };

  $("#wptSubmit").on('click', function() {
    var failed = false;
    if ((parseFloat($("#wptLatitude").val()) > 90) || (parseFloat($("#wptLatitude").val()) < -90)) {
      alert("Latitude must be in range -90 to 90");
      failed = true;
    }
    if ((parseFloat($("#wptLongitude").val()) > 180) || (parseFloat($("#wptLongitude").val()) < -180)) {
      alert("Longitude must be in range -180 to 180");
      failed = true;
    }
    if (failed) {
      return false;
    }

    var obj = {};
    obj.lat = $("#wptLatitude").val();
    obj.lon = $("#wptLongitude").val();
    coords.push(obj);
    $("#wptLatitude").val("");
    $("#wptLongitude").val("");
    return false;
  });

  $("#fileSubmitBtn").on('click', function() {
    var fileInput = document.getElementById('fileToBeUploaded');
    var file = fileInput.files[0];
    if (file == undefined) {
      alert("No file selected");
      return false;
    }

    if (!(((file.name).toLowerCase()).includes(".gpx"))) {
      alert("Not a GPX file");
      return false;
    }

    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);

    formData.append('file', file);

    var xhr = new XMLHttpRequest();
    // Add any event handlers here...
    xhr.onload = function () {
      if (xhr.status === 200) {
        // File(s) uploaded
        console.log('File uploaded successfully');
        repopulateFileLog();
      } else {
        console.log('Something went wrong uploading the file.' + xhr.response);
        alert('Something went wrong uploading the file. ' + xhr.response);
      }
    };
    xhr.onerror = function () {
      console.log("Upload error");
      alert("Upload error");
    };
    xhr.onabort = function () {
      console.log("Upload aborted");
      alert("Upload aborted");
    };
    xhr.open('POST', form.getAttribute('action'), true);
    xhr.send(formData);
    return false; // To avoid actual submission of the form
  });

  $("#createSubmit").on('click', function() {
    if (!(($("#createFilename").val()).substr($("#createFilename").val().length - 4) == ".gpx")) {
      alert("File name must end with .gpx");
      return false;
    }
    if ($("#createVersion").val() != 1.1) {
      alert("GPX Version must be 1.1");
      return false;
    }
    $.ajax({
        type: 'get',            //Request type
        url: '/createGPXFile',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          filename: $("#createFilename").val(),
          version: $("#createVersion").val(),
          creator: $("#createCreator").val()
        },
        success: function (data) {
          console.log("GPX file created");
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to crate GPX file: " + error);
            alert("Failed to crate GPX file: " + error);
        }
    });
    repopulateFileLog();
    return false;
  });

  $("#routeSubmit").on('click', function() {

    $.ajax({
        type: 'get',            //Request type
        url: '/addARoute',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          filename: $("#fileDropDownRoute").children("option:selected").val(),
          name: $("#routeName").val(),
          waypoints: coords
        },
        success: function (data) {
          console.log("Added route succesfully");
          repopulateFileLog();
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to add route: " + error);
        }
    });

    coords = [];
    return false;
  });

  $("#betweenSubmit").on('click', function() {
    $("#findBetweenTableBody").empty();
    var failed = false;
    if ((parseFloat($("#startLat").val()) > 90) || (parseFloat($("#startLat").val()) < -90)) {
      alert("Start Latitude must be in range -90 to 90");
      failed = true;
    }
    if ((parseFloat($("#startLong").val()) > 80) || (parseFloat($("#startLong").val()) < -180)) {
      alert("Start Longitude must be in range -180 to 80");
      failed = true;
    }
    if ((parseFloat($("#endLat").val()) > 90) || (parseFloat($("#endLat").val()) < -90)) {
      alert("End Latitude must be in range -90 to 90");
      failed = true;
    }
    if ((parseFloat($("#endLong").val()) > 80) || (parseFloat($("#endLong").val()) < -180)) {
      alert("End Longitude must be in range -180 to 80");
      failed = true;
    }
    if ((parseFloat($("#tolerance").val())) < 0) {
      alert("Tolerance must be positive");
      failed = true;
    }
    if (failed) {
      return false;
    }
    $.ajax({
        type: 'get',            //Request type
        url: '/findBetween',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          startLat: $("#startLat").val(),
          startLong: $("#startLong").val(),
          endLat: $("#endLat").val(),
          endLong: $("#endLong").val(),
          tolerance: $("#tolerance").val()
        },
        success: function (data) {
          //console.log("Find Between Success Data");
          for (var i = 0; i < data.foo.length; i++) {
            if (data.foo[i] != null) {
              var parsedResult = JSON.parse(data.foo[i]);
              var newElem;
              for (var j = 0; j < parsedResult.length; j++) {
                  if (parsedResult[j]['compType'] == "Route") {
                    newElem = "<tr><td>" + parsedResult[j]['compType'] + "</td><td>" + parsedResult[j]['name'] + "</td><td>" + parsedResult[j]['numPoints'] + " </td><td>" + parsedResult[j]['len'] + "</td><td>" + parsedResult[j]['loop'] + "</td>";
                  }
                  else {
                    newElem = "<tr><td>" + parsedResult[j]['compType'] + "</td><td>" + parsedResult[j]['name'] + "</td><td></td><td>" + parsedResult[j]['len'] + "</td><td>" + parsedResult[j]['loop'] + "</td>";
                  }
              }
              //var routeJSON = (data.foo[i]).substring(1, data.foo[i].length-1);
              //var parsedRoute = JSON.parse(routeJSON);
              //var newElem = "<tr><td>" + parsedRoute['compType'] + "</td><td>" + parsedRoute['name'] + "</td><td>" + parsedRoute['numPoints'] + " </td><td>" + parsedRoute['len'] + "</td><td>" + parsedRoute['loop'] + "</td>";
              $("#findBetweenTableBody").append(newElem);
            }
          }
          console.log("Succesfully checked for paths between.")
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to check paths between: " + error);
        }
    });
  });

//On Show Attr Click
  $("#gpxListTableBody").on('click', "#showAttr", function() {
    //console.log($(this).parent().parent().children().first().html());
    var compType = ($(this).parent().parent().children().first().html()).substring(0, 5);
    //console.log(compType);
    var compName = $(this).parent().parent().children().eq(1).html();
    //console.log(compName);
    $.ajax({
        type: 'get',            //Request type
        url: '/getAttrList',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          filename: $("#fileDropDown").children("option:selected").val(),
          componentType: compType,
          name: compName
        },
        success: function (data) {
          //console.log(data);
          var stringVar = "";
          for (var i = 0; i < data.foo.length; i++) {
            stringVar = stringVar + "Name: " + data.foo[i]['name'] + " Value: " + data.foo[i]['value'] + "\n";
          }
          console.log("Succesfully got attributes");
          alert(stringVar);
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get attributes: " + error);
            alert("Failed to get attributes: " + error);
        }
    });
  });


  //On rename Click
    $("#gpxListTableBody").on('click', "#renameButton", function() {
      var compType = ($(this).parent().parent().children().first().html()).substring(0, 5);
      var compName = $(this).parent().parent().children().eq(1).html();
      var txtInput = prompt("Please enter the new name:", "");
      $.ajax({
          type: 'get',            //Request type
          url: '/renameComponent',   //The server endpoint we are connecting to
          data: {
            filename: $("#fileDropDown").children("option:selected").val(),
            componentType: compType,
            name: compName,
            newName: txtInput
          },
          success: function (data) {
            //refresh page or force td to change value
            console.log("Succesfully renamed component");
            repopulateGPXLog();
          },
          fail: function(error) {
              // Non-200 return, do something with error
              console.log("Failed to rename component: " + error);
              alert("Failed to rename component: " + error);
          }
      });
    });


//On file drop down change
  $("#fileDropDown").click(function() {
    //console.log(this.value);
    repopulateGPXLog();
  });

  var dbLoginSuccess = function () {
    $("#sqlContent").show();
    $("#storeFiles").attr("disabled", true);
    if (files.length > 0) {
      $("#storeFiles").attr("disabled", false);
    }
  }

  $("#loginDB").on('click', function() {
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/loginDB',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          sqlUsername: $("#sqlUsername").val(),
          sqlPassword: $("#sqlPassword").val(),
          sqlDbName: $("#sqlDbName").val()
        },
        success: function (data) {
            if (!(data.retStr.includes("Error"))) {
              if (!(data.retStr.includes("Access denied"))) {
                dbLoginSuccess();
                alert("Succesfully logged in!");
              }
            }
            else {
              alert(data.retStr);
              if (!(data.retStr.includes("Access denied"))) {
                dbLoginSuccess();
                alert("Succesfully logged in!");
              }
            }
        },
        fail: function(error) {
          console.log("Failed to connect to DB: " + error);
          alert("Failed to connect to DB: " + error);
        }
    });
    return false;
  });

  $("#storeFiles").on('click', function() {
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/storeFiles',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          files: files
        },
        success: function (data) {
          if (!(data.retStr.includes("Error"))) {
            alert("Succesfully stored files!");
          }
          else {
            alert(data.retStr);
          }
          $('#dbStatus').click();
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to store files: " + error);
            alert("Failed to store files: " + error);
        }
    });
    return false;
  });

  $("#clearData").on('click', function() {
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/clearData',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          alert(data.retStr);
          $('#dbStatus').click();
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to clear data: " + error);
            alert("Failed to clear data: " + error);
        }
    });
    return false;
  });

  $("#dbStatus").on('click', function() {
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/dbStatus',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got DB Status");
          alert(data.retStr);
          alert("Database has " + data.fileCount + " files, " + data.routeCount + " routes, " + data.pointCount + " points.");
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Status: " + error);
            alert("Failed to get DB Status: " + error);
        }
    });
    return false;
  });

  $("#dispAllRoutes").on('click', function() {
    $("#dispAllRoutesTableBody").empty();
    hideQueries();
    $("#dispAllRoutesDiv").show();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispAllRoutes',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes");
          alert(data.retStr);
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispAllRoutesTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes: " + error);
            alert("Failed to get DB Routes: " + error);
        }
    });
    return false;
  });

  $("#dispAllRoutesName").on('click', function() {
    $("#dispAllRoutesTableBody").empty();
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/dispAllRoutesSortName',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes Sorted by Name");
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispAllRoutesTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes Sorted By name: " + error);
            alert("Failed to get DB Routes sorted by Name: " + error);
        }
    });
    return false;
  });

  $("#dispAllRoutesLength").on('click', function() {
    $("#dispAllRoutesTableBody").empty();
    //Validate user inputs
    $.ajax({
        type: 'get',            //Request type
        url: '/dispAllRoutesSortLength',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes sorted by length");
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispAllRoutesTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes sorted by length: " + error);
            alert("Failed to get DB Routes sorted by length: " + error);
        }
    });
    return false;
  });

  $("#dispRouteFile").on('click', function() {
    $("#dispRouteFileTableBody").empty();
    hideQueries();
    $("#dispRouteFileDiv").show();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispRouteFile',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes with file names");
          alert(data.retStr);
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].file_name + "</td><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispRouteFileTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes with file names: " + error);
            alert("Failed to get DB Routes with file names: " + error);
        }
    });
    return false;
  });

  $("#dispRouteFileFile").on('click', function() {
    $("#dispRouteFileTableBody").empty();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispRouteFileFile',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes with file names");
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].file_name + "</td><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispRouteFileTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes with file names: " + error);
            alert("Failed to get DB Routes with file names: " + error);
        }
    });
    return false;
  });

  $("#dispRouteFileName").on('click', function() {
    $("#dispRouteFileTableBody").empty();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispRouteFileName',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes with file names");
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].file_name + "</td><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispRouteFileTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes with file names: " + error);
            alert("Failed to get DB Routes with file names: " + error);
        }
    });
    return false;
  });

  $("#dispRouteFileLength").on('click', function() {
    $("#dispRouteFileTableBody").empty();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispRouteFileLength',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes with file names");
          for (var i = 0; i < data.allRoutes.length; i++) {
            var newElem = "<tr><td>" + data.allRoutes[i].file_name + "</td><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].route_len + "</td></tr>"
            $("#dispRouteFileTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes with file names: " + error);
            alert("Failed to get DB Routes with file names: " + error);
        }
    });
    return false;
  });

  //$("#fileDropDownRoute").append('<option value="' + data.foo['filename'] + '">' + data.foo['filename'] + '</option>');
  $("#dispPointRoute").on('click', function() {
    $("#dispPointRouteTableBody").empty();
    hideQueries();
    $("#dispPointRouteDiv").show();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispAllRoutes',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Routes");
          alert(data.retStr);
          for (var i = 0; i < data.allRoutes.length; i++) {
            if (!($("#dispPointRouteSelect option[value='" + data.allRoutes[i].route_id + "']").length > 0)) {
              var newElem = "<option value=" + data.allRoutes[i].route_id + ">" + data.allRoutes[i].route_name + "</option>";
              $("#dispPointRouteSelect").append(newElem);
            }
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Routes: " + error);
            alert("Failed to get DB Routes: " + error);
        }
    });
    return false;
  });

  $("#dispPointRouteSelect").on('click', function() {
    $("#dispPointRouteTableBody").empty();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispPointRouteSelect',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          route_id: $("#dispPointRouteSelect").children("option:selected").val()
        },
        success: function (data) {
          console.log("Got All DB Route Points");
          alert(data.retStr);
          for (var i = 0; i < data.allPoints.length; i++) {
            if (data.allPoints[i].point_name == null) {
              data.allPoints[i].point_name = "";
            }
            var newElem = "<tr><td>" + data.allPoints[i].point_name + "</td><td>" + data.allPoints[i].latitude + "</td><td>" + data.allPoints[i].longitude + "</td></tr>";
            $("#dispPointRouteTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Route Points: " + error);
            alert("Failed to get DB Route Points: " + error);
        }
    });
    return false;
  });

  $("#dispPointFile").on('click', function() {
    $("#dispPointFileTableBody").empty();
    hideQueries();
    $("#dispPointFileDiv").show();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispAllFiles',   //The server endpoint we are connecting to
        dataType: 'json',
        success: function (data) {
          console.log("Got All DB Files");
          alert(data.retStr);
          for (var i = 0; i < data.allFiles.length; i++) {
            if (!($("#dispPointFileSelect option[value='" + data.allFiles[i].gpx_id + "']").length > 0)) {
              var newElem = "<option value=" + data.allFiles[i].gpx_id + ">" + data.allFiles[i].file_name + "</option>";
              $("#dispPointFileSelect").append(newElem);
            }
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB Files: " + error);
            alert("Failed to get DB Files: " + error);
        }
    });
    return false;
  });


  $("#dispPointFileSelect").on('click', function() {
    $("#dispPointFileTableBody").empty();

    $.ajax({
        type: 'get',            //Request type
        url: '/dispPointFileSelect',   //The server endpoint we are connecting to
        dataType: 'json',
        data: {
          gpx_id: $("#dispPointFileSelect").children("option:selected").val()
        },
        success: function (data) {
          console.log("Got All DB File Points");
          alert(data.retStr);
          for (var i = 0; i < data.allRoutes.length; i++) {
            if (data.allRoutes[i].route_name == null) {
              data.allRoutes[i].route_name = "Unnamed route " + i;
            }
            if (data.allRoutes[i].point_name == null) {
              data.allRoutes[i].point_name = "";
            }
            var newElem = "<tr><td>" + data.allRoutes[i].route_name + "</td><td>" + data.allRoutes[i].point_name + "</td><td>" + data.allRoutes[i].latitude + "</td><td>" + data.allRoutes[i].longitude + "</td></tr>";
            $("#dispPointFileTableBody").append(newElem);
          }
        },
        fail: function(error) {
            // Non-200 return, do something with error
            console.log("Failed to get DB File Points: " + error);
            alert("Failed to get DB File Points: " + error);
        }
    });
    return false;
  });

  repopulateFileLog();
  $("#sqlContent").hide();
  hideQueries();

});
