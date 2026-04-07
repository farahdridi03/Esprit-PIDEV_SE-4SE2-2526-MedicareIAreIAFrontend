pipeline {
    agent any
    
    environment {
        // Adapt to your Docker Hub username
        DOCKER_HUB_USER = "azizmelki1"
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
                withCredentials([usernamePassword(credentialsId: REGISTRY_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ."
                    sh "echo '${DOCKER_PASS}' | docker login -u ${DOCKER_HUB_USER} --password-stdin"
                    sh "docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
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
