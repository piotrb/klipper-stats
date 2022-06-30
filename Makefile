clean:
	rm -vf src/*.js

dev:
	DOCKER_BUILDKIT=1 docker build . --target base -t klipper-stats:dev
	docker run -it -p 3030:3000 --entrypoint /bin/bash -v `pwd`:/app --env-file .env klipper-stats:dev

run: clean
	DOCKER_BUILDKIT=1 docker build . -t klipper-stats:latest
	docker run --env-file .env klipper-stats:latest
