const sonarqubeScanner = require("sonarqube-scanner");
sonarqubeScanner(
  {
    serverUrl: "http://43.205.212.74:9000/",
    options: {
      "sonar.projectDescription":
        "This is a Taski2020 repository Node JS container",
      "sonar.projectName": "taSkiWeb",
      "sonar.projectKey": "taskiweb",
      "sonar.login": "admin",
      "sonar.password": "admin",
      "sonar.projectVersion": "1.0",
      "sonar.language": "js",
      "sonar.sourceEncoding": "UTF-8",
      "sonar.sources": ".",
      //'sonar.tests': 'specs',
      //'sonar.inclusions' : 'src/**'
    },
  },
  () => {}
);
