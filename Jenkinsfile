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

        stage('Docker Build & Push') {
            steps {
                script {
                    // Let Docker handle the multi-stage build (Angular build + Nginx server)
                    // The Dockerfile already contains the build steps (npm install, npm build)
                    docker.withRegistry('', REGISTRY_CREDENTIALS_ID) {
                        def customImage = docker.build("${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}")
                        customImage.push()
                    }
                }
            }
        }
    }
}
