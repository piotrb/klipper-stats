dev:
	DOCKER_BUILDKIT=1 docker build . --target dev -t klipper-stats:dev
	docker run -it -p 3030:3000 --entrypoint /bin/bash -v `pwd`:/app --env-file .env klipper-stats:dev

run:
	DOCKER_BUILDKIT=1 docker build . -t klipper-stats:latest
	docker run -it --env-file .env klipper-stats:latest
