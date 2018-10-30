
function loadXML(xml_path, callback) {
   console.log("LOADDDDDD");
   var xobj = new XMLHttpRequest();
   // xobj.overrideMimeType("application/json");
   xobj.open('GET', xml_path, true);

   xobj.onreadystatechange = function () {
       console.log("READYYY");
       if (xobj.readyState == 4 && xobj.status == "200")
           callback(xobj.responseText);
   };
   xobj.send();
}
