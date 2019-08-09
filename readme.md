HttpExec
========

Provides the ability to execute shell commands on remote server over http, stream stdout, stderr and return exit code.

Usage
-----

### Start server:

- manually:

  ```bash
  docker run --rm \
    -e HTTPEXEC_TOKEN=12345 \
    # -p '8080:80' \
    # -v '/var/run/docker.sock:/var/run/docker.sock' \
    # -v '/root:/root' \
    prog/httpexec server
  ```

- in Docker Compose/Stack:

  ```yaml
  httpexec:
    image: prog/httpexec
    command: server
    environment:
      - 'HTTPEXEC_TOKEN=12345'
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
    # - '/root/.docker:/root/.docker'
    # ports:
    #   - '<port>:80'
    deploy:
      placement:
        constraints:
          - node.role == manager
  ```

### Execute command

- manually

  ```bash
  docker run --rm \
    -e HTTPEXEC_SERVER=https://server/ \
    -e HTTPEXEC_TOKEN=12345 \
    prog/httpexec <remote-command> 
  ```

- in gitlab-ci

  ```yaml
  deploy:
    stage: deploy
    image: prog/httpexec
    environment:
      - 'HTTPEXEC_URL=https://server/'
      - 'HTTPEXEC_TOKEN=12345'
    script:
      - httpexec <remote-command>
      - # httpexec docker service update --force <service-name> <image>:<tag>
  ```
