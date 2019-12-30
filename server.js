const targetPort = 8888;
const request = require('request');
const express = require('express');
const fs = require('fs');
const app = express();
const path = require("path");
const bodyParser = require ('body-parser');
const camundaEngineUrl = 'http://localhost:8080/engine-rest/'; 
const {
  Client,
  logger,
  Variables,
  File
} = require("camunda-external-task-client-js");
const config = { baseUrl: "http://localhost:8080/engine-rest", use: logger };
const client = new Client(config);

if (process.env.CAMUNDA_URL) {
  camundaEngineUrl = process.env.CAMUNDA_URL;
}

if (process.env.TARGET_PORT) {
  targetPort = process.env.TARGET_PORT;
}

console.log('Use Camunda Server at ' + camundaEngineUrl);

app.use(express.static(__dirname + '/paginas'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/default.html"));
})

app.get("/inicio",(req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/inicio.html"));
})

app.get("/ejercicio1", (req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/ejercicio1.html"));
});

app.get("/ejercicio2", (req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/ejercicio2.html"));
});

app.get("/ejercicio3C1", (req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/ejercicio3C1.html"));
});

app.get("/ejercicio3C2", (req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/ejercicio3C2.html"));
});

app.get("/ejercicio4", (req,res)=>{
  res.sendFile(path.join(__dirname + "/paginas/ejercicio4.html"));
});

function deployProcess() {
  filename = 'corregirexamen.bpmn';
  filepath = path.join(__dirname, filename);
  console.log(filepath);
  request(
      {
        method: "POST",
        uri: camundaEngineUrl + 'engine/default/deployment/create',
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData : {
            'deployment-name': 'CorregirExamen',
            'enable-duplicate-filtering': 'true',
            'deploy-changed-only': 'true',
            'scripttest.bpmn': {
              'value':  fs.createReadStream(filepath),
              'options': {'filename': filename}
            }
        }
      }, function (err, res, body) {
          if (err) {
            console.log(err);
            throw err;
          }
          console.log('[%s] Deployment succeeded: ' + body);
  });
};

function startProcess(nombre,apellido,dni,comision) {
  request(
    {
      method: "POST",
      uri: camundaEngineUrl + 'engine/default/process-definition/key/'+'CorregirExamen'+'/start',
      json: {
        'variables': {
          'Nombre' : {
            'value' : nombre,
            'type': 'String'
          },
          'Apellido': {
            'value' : apellido,
            'type' : 'String'
          },
          'DNI': {
            'value' : dni,
            'type' : 'String'
          },
          'Comision': {
            'value' : comision,
            'type' : 'Integer'
          },
        },
        'businessKey': dni,
      }
    }, function (err, res, body) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log('Process instance started: ' + body);
  });
};

function getTask1(unoA, unoB, dni){
  request(
    {
      method: "GET",
      uri: camundaEngineUrl + 'engine/default/process-instance',
      qs: {
        'businessKey': dni,
      }
    }, function (err, res, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      var instance = JSON.parse(body);
      var pid = instance[0].id;
      request(
        {
          method:"GET",
          uri: camundaEngineUrl + 'engine/default/task/',
        },function(err, res, body){
          if(err){
            console.log(err);
            throw err;
          }
          var tasklist = JSON.parse(body);
          let i=0;
          let band = true;
          while((tasklist[i] != null)&&(band)){
            if(tasklist[i].processInstanceId == pid){
              band = false;
              taskid = tasklist[i].id;
            }
            i++;
          }
          request(
            {
              method: "POST",
              uri: camundaEngineUrl + 'engine/default/task/'+taskid+'/submit-form',
              json: {
                'variables': {
                  'unoA' : {
                    'value' : unoA,
                    'type': 'Long'
                  },
                  'unoB': {
                    'value' : unoB,
                    'type' : 'Long'
                  },
                }
              }
            }, function (err, res, body) {
                if (err) {
                  console.log(err);
                  throw err;
                }
                console.log(dni+' ya tiene corregido el ejercicio 1');
          });  
    
      }); 
  });  
};

function getTask2(dosA, dosB, dosC, dni){
  console.log("entre a getInstance2");
  request(
    {
      method: "GET",
      uri: camundaEngineUrl + 'engine/default/process-instance',
      qs: {
        'businessKey': dni,
      }
    }, function (err, res, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      var instance = JSON.parse(body);
      var pid = instance[0].id;
      request(
        {
          method:"GET",
          uri: camundaEngineUrl + 'engine/default/task/',
        },function(err, res, body){
          if(err){
            console.log(err);
            throw err;
          }
          var tasklist = JSON.parse(body);
          let i=0;
          let band = true;
          while((tasklist[i] != null)&&(band)){
            if(tasklist[i].processInstanceId == pid){
              band = false;
              taskid = tasklist[i].id;
            }
            i++;
          }
          request(
            {
              method: "POST",
              uri: camundaEngineUrl + 'engine/default/task/'+taskid+'/submit-form',
              json: {
                'variables': {
                  'dosA' : {
                    'value' : dosA,
                    'type': 'Long'
                  },
                  'dosB': {
                    'value' : dosB,
                    'type' : 'Long'
                  },
                  'dosC': {
                    'value' : dosC,
                    'type' : 'Long'
                  },
                }
              }
            }, function (err, res, body) {
                if (err) {
                  console.log(err);
                  throw err;
                }
                console.log(dni+' ya tiene corregido el ejercicio 2');
          });  
    
      }); 
  });  
};

function getTask3(tres, dni){
  console.log("entre a getInstance3");
  request(
    {
      method: "GET",
      uri: camundaEngineUrl + 'engine/default/process-instance',
      qs: {
        'businessKey': dni,
      }
    }, function (err, res, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      var instance = JSON.parse(body);
      var pid = instance[0].id;
      request(
        {
          method:"GET",
          uri: camundaEngineUrl + 'engine/default/task/',
        },function(err, res, body){
          if(err){
            console.log(err);
            throw err;
          }
          var tasklist = JSON.parse(body);
          let i=0;
          let band = true;
          while((tasklist[i] != null)&&(band)){
            if(tasklist[i].processInstanceId == pid){
              band = false;
              taskid = tasklist[i].id;
            }
            i++;
          }
          request(
            {
              method: "POST",
              uri: camundaEngineUrl + 'engine/default/task/'+taskid+'/submit-form',
              json: {
                'variables': {
                  'tres' : {
                    'value' : tres,
                    'type': 'Long'
                  },
                }
              }
            }, function (err, res, body) {
                if (err) {
                  console.log(err);
                  throw err;
                }
                console.log(dni+' ya tiene corregido el ejercicio 3');
          });  
    
      }); 
  });  
};

function getTask4(cuatroA, cuatroB, dni){
  request(
    {
      method: "GET",
      uri: camundaEngineUrl + 'engine/default/process-instance',
      qs: {
        'businessKey': dni,
      }
    }, function (err, res, body) {
      if (err) {
        console.log(err);
        throw err;
      }
      var instance = JSON.parse(body);
      var pid = instance[0].id;
      request(
        {
          method:"GET",
          uri: camundaEngineUrl + 'engine/default/task/',
        },function(err, res, body){
          if(err){
            console.log(err);
            throw err;
          }
          var tasklist = JSON.parse(body);
          let i=0;
          let band = true;
          while((tasklist[i] != null)&&(band)){
            if(tasklist[i].processInstanceId == pid){
              band = false;
              taskid = tasklist[i].id;
            }
            i++;
          }
          request(
            {
              method: "POST",
              uri: camundaEngineUrl + 'engine/default/task/'+taskid+'/submit-form',
              json: {
                'variables': {
                  'cuatroA' : {
                    'value' : cuatroA,
                    'type': 'Long'
                  },
                  'cuatroB': {
                    'value' : cuatroB,
                    'type' : 'Long'
                  },
                }
              }
            }, function (err, res, body) {
                if (err) {
                  console.log(err);
                  throw err;
                }
                console.log(dni+' ya tiene corregido el ejercicio 3');
          });  
    
      }); 
  });  
};

//funcion para obtener la lista de tareas. Es para debugear.
function getTask(){
  request(
    {
      method:"GET",
      uri: camundaEngineUrl + 'engine/default/task/',
    },function(err, res, body){
      if(err){
        console.log(err);
        throw err;
      }
      var tasklist = JSON.parse(body);
      console.log(tasklist);
    });
};

//se intenta el deploy siempre al iniciar, si el modelo no fue modificado no se hace.
deployProcess();

app.post("/inicio",(req,res)=>{
  let nombre = req.body.nombre;
  let apellido = req.body.apellido;
  let dni = req.body.dni;
  let comision =  req.body.comision;
  startProcess(nombre,apellido,dni,comision);
  /*let pagina= '<!doctype html><html><head>Process Started</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/inicio.html"));
});

app.post("/ejercicio1",(req,res)=>{
  let dni = req.body.dni;
  let unoA = req.body.unoA;
  let unoB = req.body.unoB;
  getTask1(unoA, unoB, dni);
  /*let pagina= '<!doctype html><html><head>Task Finished</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/ejercicio1.html"));
});

app.post("/ejercicio2",(req,res)=>{
  console.log("entre a ejercicio2");
  let dni = req.body.dni;
  let dosA = req.body.dosA;
  let dosB = req.body.dosB;
  let dosC = req.body.dosC;
  getTask2(dosA, dosB, dosC, dni);
  /*let pagina= '<!doctype html><html><head>Task Finished</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/ejercicio2.html"));
});

app.post("/ejercicio3C1",(req,res)=>{
  let dni = req.body.dni;
  let tres = req.body.tres;
  getTask3(tres, dni);
  /*let pagina= '<!doctype html><html><head>Task Finished</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/ejercicio3C1.html"));
});

app.post("/ejercicio3C2",(req,res)=>{
  let dni = req.body.dni;
  let tres = req.body.tres;
  getTask3(tres, dni);
  /*let pagina= '<!doctype html><html><head>Task Finished</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/ejercicio3C2.html"));
});

app.post("/ejercicio4",(req,res)=>{
  let dni = req.body.dni;
  let cuatroA = req.body.cuatroA;
  let cuatroB = req.body.cuatroB;
  getTask4(cuatroA, cuatroB, dni);
  /*let pagina= '<!doctype html><html><head>Task Finished</head><body></body></html>'
  res.send(pagina);*/
  res.sendFile(path.join(__dirname + "/paginas/ejercicio4.html"));
});

client.subscribe("CalcularNota", async function({ task, taskService }) {
  const uno = (task.variables.get("unoA") + task.variables.get("unoB"))/2;
  const dos = (task.variables.get("dosA") + task.variables.get("dosB") + task.variables.get("dosC"))/3;
  const tres = task.variables.get("tres");
  const cuatro = (task.variables.get("cuatroA") + task.variables.get("cuatroB"))/2;
  let nota = (uno + dos + tres + cuatro)/4;
  console.log("La nota final es: "+nota);
  const processVariables = new Variables();
  processVariables.set("Nota", nota);
  await taskService.complete(task, processVariables);
});


var server = app.listen(targetPort, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('REST API now listening at http://%s:%s', host, port)
});