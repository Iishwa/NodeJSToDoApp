pipeline {
    agent any

    environment {
        // DockerHub credentials ID stored in Jenkins
        DOCKER_CREDENTIALS = 'dockerhub-creds'
        // SonarQube server configured in Jenkins
        SONARQUBE_SERVER = 'SonarQube-Server'
        // GitHub repo URL
        GIT_REPO = 'https://github.com/Iishwa/NodeJSToDoApp.git'
        // Docker image name
        IMAGE_NAME = 'nodejstodoapp-todoapi'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_SERVER}") {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=NodeJSToDoApp \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://13.204.208.65:9000 \
                        -Dsonar.token=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh "trivy image --exit-code 0 --severity HIGH ${IMAGE_NAME}:latest"
            }
        }

        stage('Dependency Check') {
            steps {
                sh '''
                    dependency-check.sh \
                    --project NodeJSToDoApp \
                    --scan . \
                    --format HTML \
                    --out dependency-check-report.html
                '''
            }
        }

        stage('Gitleaks Scan') {
            steps {
                sh "gitleaks detect --source . --report-format json --report-path gitleaks-report.json"
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker tag ${IMAGE_NAME}:latest ${DOCKER_USER}/${IMAGE_NAME}:latest
                        docker push ${DOCKER_USER}/${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Deploy Locally on EC2') {
            steps {
                sh '''
                    docker stop todoapi || true
                    docker rm todoapi || true
                    docker run -d --name todoapi -p 3000:3000 ${IMAGE_NAME}:latest
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished. Reports archived.'
            archiveArtifacts artifacts: '**/*.html, **/*.json', allowEmptyArchive: true
        }
    }
}
