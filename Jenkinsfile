pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = "azizmelki"
        IMAGE_NAME = "medicarepi-frontend"
        IMAGE_TAG = "latest"
        // On suppose que vous avez créé un ID de credentials "docker-hub-credentials" de type Username/Password
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build & Push') {
            steps {
                sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
    }
}
