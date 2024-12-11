// utils/dockerManager.js
const Docker = require('dockerode');
const logger = require('./logger');

class DockerManager {
  constructor() {
    this.docker = new Docker(); // 기본 Docker 소켓 사용
  }

  async startContainer() {
    try {
      // 이미지 풀
      logger.info('Pulling Docker image...');
      await this.docker.pull('hyejiyu/cloudproject-data:latest');

      // 기존 컨테이너 확인 및 제거
      const containers = await this.docker.listContainers({ all: true });
      const existingContainer = containers.find(c => c.Names.includes('/cron-container'));
      
      if (existingContainer) {
        const container = this.docker.getContainer(existingContainer.Id);
        if (existingContainer.State === 'running') {
          await container.stop();
        }
        await container.remove();
      }

      // 새 컨테이너 생성 및 시작
      const container = await this.docker.createContainer({
        Image: 'hyejiyu/cloudproject-data:latest',
        name: 'cron-container',
        HostConfig: {
          Binds: [`${process.cwd()}/output:/app/output`]
        }
      });

      await container.start();
      logger.info('Docker container started successfully');
    } catch (error) {
      logger.error('Error managing Docker container:', error);
      throw error;
    }
  }
}

module.exports = new DockerManager();