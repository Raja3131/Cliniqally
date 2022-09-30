pipeline {
  agent any
  tools {nodejs "Node16.14"}
    options {
    // This is required if you want to clean before build
    skipDefaultCheckout(true)
  }
  stages {
    stage('Clean workspace') {
      steps {
        deleteDir()
        /* clean up tmp directory */
        dir("${workspace}@tmp") {
            deleteDir()
        }
        /* clean up script directory */
        dir("${workspace}@script") {
            deleteDir()
        }
        // Clean before build
        cleanWs()
        // We need to explicitly checkout from SCM here
        checkout scm
        echo "Building ${env.JOB_NAME}..."
      }
    }
    stage('Pre Requisite') {
        steps {
          sh 'node -v'
        }
      }
    stage('Built for beta') {
      when {
        branch 'beta'
      }
      steps {
        sh 'npm i'
        sh 'npm run build:beta'
      }
    }
    stage('Deploy for beta') {
      when {
        branch 'beta'
      }
      steps {
        sh 'pwd'
      }
    }
    stage('Start beta server in PM2') {
      when {
        branch 'beta'
      }
      steps {
        echo '*****.Running pm2.*****'
        sh 'pm2 stop /home/root/cliniqally-deploy.json'
        sh 'pm2 start /home/root/cliniqally-deploy.json'
      }
    }
    // stage('Built for qa') {
    //   when {
    //     branch 'qa'
    //   }
    //   steps {
    //     sh 'npm i'
    //     sh 'npm run build:qa'
    //   }
    // }
    // stage('Deploy for qa') {
    //   when {
    //     branch 'qa'
    //   }
    //   steps {
    //     sh 'pwd'
    //     sh 'sshpass -p "ThFWjPLaxHXdgpPpLrq41234" ssh -o StrictHostKeyChecking=no root@135.181.204.153 "source ~/.nvm/nvm.sh; pwd; node -v; cd /var/www/edr-backend/; pwd; pm2 stop /home/root/edr-deploy.json; exit;"'
    //     sh 'sshpass -p "ThFWjPLaxHXdgpPpLrq41234" scp -r -o StrictHostKeyChecking=no ./dist/* ./dist/.env root@135.181.204.153:/var/www/edr-backend/code'
    //     sh 'sshpass -p "ThFWjPLaxHXdgpPpLrq41234" scp -r -o StrictHostKeyChecking=no ./package.json ./package-lock.json root@135.181.204.153:/var/www/edr-backend'
    //     sh 'sshpass -p "ThFWjPLaxHXdgpPpLrq41234" ssh -o StrictHostKeyChecking=no root@135.181.204.153 "source ~/.nvm/nvm.sh; pwd; node -v; cd /var/www/edr-backend/; pwd; npm i; pm2 start /home/root/edr-deploy.json; exit;"'
    //   }
    // }
    // stage('CleanWorkspace for qa') {
    //   when {
    //     branch 'qa'
    //   }
    //   steps {
    //     /* clean up our workspace */
    //     deleteDir()
    //     /* clean up tmp directory */
    //     dir("${workspace}@tmp") {
    //         deleteDir()
    //     }
    //     /* clean up script directory */
    //     dir("${workspace}@script") {
    //         deleteDir()
    //     }
    //   }
    // }
    // stage('Built for production') {
    //   when {
    //     branch 'main'
    //   }
    //   steps {
    //     sh 'npm i'
    //     sh 'npm run build:prod'
    //   }
    // }
    // stage('Deploy for production') {
    //   when {
    //     branch 'main'
    //   }
    //   steps {
    //     sh 'pwd'
    //     sh 'sshpass -p "qNanTEjmapgWAkr4KHUv123" ssh -o StrictHostKeyChecking=no root@135.181.38.219 "source ~/.nvm/nvm.sh; pwd; node -v; cd /var/www/edr-backend/; pwd; pm2 stop /home/root/edr-deploy.json; exit;"'
    //     sh 'sshpass -p "qNanTEjmapgWAkr4KHUv123" scp -r -o StrictHostKeyChecking=no ./dist/* ./dist/.env root@135.181.38.219:/var/www/edr-backend/code'
    //     sh 'sshpass -p "qNanTEjmapgWAkr4KHUv123" scp -r -o StrictHostKeyChecking=no ./package.json ./package-lock.json root@135.181.38.219:/var/www/edr-backend'
    //     sh 'sshpass -p "qNanTEjmapgWAkr4KHUv123" ssh -o StrictHostKeyChecking=no root@135.181.38.219 "source ~/.nvm/nvm.sh; pwd; node -v; cd /var/www/edr-backend/; pwd; npm i; pm2 start /home/root/edr-deploy.json; exit;"'
    //   }
    // }
    // stage('CleanWorkspace for production') {
    //   when {
    //     branch 'main'
    //   }
    //   steps {
    //     /* clean up our workspace */
    //     deleteDir()
    //     /* clean up tmp directory */
    //     dir("${workspace}@tmp") {
    //         deleteDir()
    //     }
    //     /* clean up script directory */
    //     dir("${workspace}@script") {
    //         deleteDir()
    //     }
    //   }
    // }
  }
}