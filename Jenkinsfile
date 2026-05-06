pipeline {
    agent any

    environment {
        IMAGE_NAME = "todoapi"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Iishwa/NodeJSToDoApp.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=NodeJSToDoApp \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=$SONAR_HOST_URL \
                      -Dsonar.login=$SONAR_AUTH_TOKEN
                      -Dsonar.login=sqa_4025a554e0108b2af65248043fa0e28238b21eaf
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u lishwar --password-stdin"
                    sh "docker build -t lishwar/${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                trivy image --exit-code 0 --severity HIGH lishwar/${IMAGE_NAME}:latest
                trivy image --exit-code 1 --severity CRITICAL lishwar/${IMAGE_NAME}:latest
                '''
            }
        }

        stage('Dependency Check') {
            steps {
                sh '''
                dependency-check.sh \
                  --project NodeJSToDoApp \
                  --scan ./ \
                  --format HTML \
                  --out ./dependency-check-report
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'dependency-check-report/*.html', fingerprint: true
                }
            }
        }

        stage('Gitleaks Scan') {
            steps {
                sh '''
                gitleaks detect --source . --report-format json --report-path gitleaks-report.json
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'gitleaks-report.json', fingerprint: true
                }
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u lishwar --password-stdin"
                    sh "docker push lishwar/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy Locally on EC2') {
            steps {
                sh '''
                cd ~/NodeJSToDoApp
                git pull origin main
                docker-compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. Reports archived."
        }
    }
}
