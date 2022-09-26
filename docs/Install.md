# Pre Step: You need to set up Prometheus + Grafana

My fork has some minor changes making life easier a bit .. 

https://github.com/piotrb/prometheus-grafana-raspberry-pi

I recommend a tweak just to make grafana a bit more secure .. 

1. Disable Anonymous logins .. even in a local install I found it annoying/confusing to have that enabled .. since it "works" .. except that you're not able to edit stuff .. 

In the docker-compose.yml file, change the line: `GF_AUTH_ANONYMOUS_ENABLED=true` to `GF_AUTH_ANONYMOUS_ENABLED=false`

After making the change, restart things .. so in the `prometheus-grafana-raspberry-pi` run `docker-compose up -d`

...

Once you have that going and you can confirm that node-exporter is actually getting your rpi's stats across to prom .. let's get this installed ..

...

# Step 1: docker-compose up -d

(all the defaults should just work, there really isn't much config here)

You can edit the envs in the docker-compose.yml file

* `PORT` is the port the http server runs on
* `KLIPPER_HOST` is .. well .. where it can find moonraker running .. since we're running this in a container .. the special `172.17.0.1` ip should just work by pointing back to the actual host

(obviously if you change any of these, restart the daemon .. `docker-compose up -d`)

# Step 2: register it with prometheus

In your `prometheus-grafana-raspberry-pi` folder .. edit the `prometheus/prometheus.yml` file

in the `scrape_configs` section add a new entry at the bottom

```
  - job_name: 'klipper-stats'
    scrape_interval: 1s
    static_configs:
      - targets: ['172.17.0.1:3030']
```

again here the `3030` is the Port you set the daemon to run on .. 
And since this is a container .. we're just exposing the 3030 port back onto the host in the other docker-compose file .. so its accessible via 3030 on the host once again (thus the special `172.17.0.1` ip address)

# Step 3: the hard part .. ish .. 

Actually set up your dashboards in grafana .. there is a bit of a learning curve there .. but your moonraker metrics should be available in there now .. 

Or go the easy way .. and import my dashboard as a base .. 

You can find examples here: https://github.com/piotrb/klipper-stats/tree/main/examples
