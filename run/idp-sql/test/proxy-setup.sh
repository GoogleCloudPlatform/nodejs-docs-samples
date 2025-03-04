curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.15.1/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
cloud_sql_proxy -dir=/cloudsql -instances=$INSTANCE_CONNECTION_NAME &
