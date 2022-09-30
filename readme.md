# Cliniqally Backend

This application is the main backend for cliniqally project

## Installation

Install cliniqally backend with npm

```bash
  npm install
  cd <ProjectName>
```

## Tech Stack

**Client:** Any Clients that can consume rest Api's

**Server:** Nginx, Node, Express, pm2, postgreSQL, mongodb, Redis cache

## Server setup

To deploy this project we need the following.

```bash
  npm run start
```

## Readme

### Max PG connections issue

Run this command in PGSQL server

```PSQL
select max_conn,used,res_for_super,max_conn-used-res_for_super res_for_normal
from
  (select count(*) used from pg_stat_activity) t1,
  (select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) t2,
  (select setting::int max_conn from pg_settings where name=$$max_connections$$) t3
```
