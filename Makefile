dev:
	DOCKER_BUILDKIT=1 docker build . --target dev -t klipper-stats:dev
	docker run --rm -it -p 3030:3000 --entrypoint /bin/bash -v `pwd`:/app --env-file .env klipper-stats:dev

run:
	DOCKER_BUILDKIT=1 docker build . --target tsnode -t klipper-stats:run
	docker run --rm -it -p 3031:3031 --env-file .env klipper-stats:run
