pipeline {
    agent any
    
    environment {
        // Adapt to your Docker Hub username
        DOCKER_HUB_USER = "azizmelki"
        IMAGE_NAME = "medicarepi-frontend"
        IMAGE_TAG = "latest"
        REGISTRY_CREDENTIALS_ID = "docker-hub-credentials"
    }

    stages {
        stage('Checkout') {
            steps {
                // Code is retrieved from Git
                checkout scm
            }
        }

        stage('Install Dependencies & Build (Angular)') {
            steps {
                // If you run this inside Jenkins, need NodeJS plugin or run inside a docker container
                sh "npm ci --legacy-peer-deps"
                sh "npm run build -- --configuration=production"
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry('', REGISTRY_CREDENTIALS_ID) {
                        def customImage = docker.build("${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}")
                        customImage.push()
                    }
                }
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                script {
                    // Update image in K8s (Needs kubeconfig configured in Jenkins)
                    sh "kubectl apply -f k8s/frontend.yaml"
                    sh "kubectl rollout restart deployment/medicarepi-frontend-deployment"
                }
            }
        }
    }
}
