@Library('jenkins-pipeline-util') _

pipeline {
  agent {
    docker {
      image 'nexus.cicd.sv2.247-inc.net:5000/247nodejs-build-centos7:14.16.1'
      args "-e HTTP_PROXY=${env.HTTP_PROXY_URL}"
    }
  }
  stages {
      stage('Info') {
        steps {
          sh '''
            env
            node -v
            npm -v
          '''
          office365ConnectorSend  message: "<h1>🏁 <a href=\"${env.BUILD_URL}\">${env.JOB_NAME} - Build ${env.BUILD_NUMBER}</a> started!</h1>",
                                  status: "STARTED",
                                  color: "#ffc107",
                                  webhookUrl: env.MS_TEAMS_WEBHOOK_URL
        }
      }
      stage('NPM Install') {
        steps {
          script {
            setupStandardNodeBuild(script: this)
          }
        }
      }
      stage('Build') {
        steps {
          sh '''
            npm run build
          '''
        }
      }
      stage('Validate & Publish Report') {
        steps {
          script {
            nodeValidate(script: this)
          }
        }
      }
      stage('Sonar Scan') {
        steps {
          script {
            sonarScan(script: this)
          }
        }
      }
      stage('Deploy release') {
        when {
          anyOf { branch 'master'; branch 'dev-release'; }
        }
        steps {
          script {
            nodePruneZipDeploy(script: this)
          }
        }
      }
      stage('Deploy version With Timestamp') {
        when {
          anyOf { branch 'develop'; }
        }
        steps {
          script {
            nodePruneZipDeploy(script: this, versionWithTimestamp: true)
          }
        }
      }
  }
  environment {
    MS_TEAMS_WEBHOOK_URL = 'https://outlook.office.com/webhook/1f6c331a-2a87-49b6-8fe6-9e5c88c4c2ce@42fbd5e8-b41c-40ab-9505-9ce8dd91c3e2/JenkinsCI/0a643726844e4daa9e1b6da5aaeb0989/a966ba0a-e16d-4b4d-a7fb-fa637226e050'
  }
  post {
    success {
      office365ConnectorSend  message: "<h1>🍻 <a href=\"${env.BUILD_URL}\">${env.JOB_NAME} - Build ${env.BUILD_NUMBER}</a> succeeded.</h1>",
                              status: "SUCCESS",
                              color: "#28a745",
                              webhookUrl: env.MS_TEAMS_WEBHOOK_URL
    }

    failure {
      office365ConnectorSend  message: "<h1>🤦 ❌ <a href=\"${env.BUILD_URL}\">${env.JOB_NAME} - Build ${env.BUILD_NUMBER}</a> failed.</h1>",
                              status: "FAILURE",
                              color: "#dc3545",
                              webhookUrl: env.MS_TEAMS_WEBHOOK_URL
    }
  }
}
