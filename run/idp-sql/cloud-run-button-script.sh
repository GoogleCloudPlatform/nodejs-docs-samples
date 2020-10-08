# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

export _SECRET_NAME="vote-sql-secrets"
export _SERVICE_ACCOUNT="vote-indentity"

gcloud config set project $GOOGLE_CLOUD_PROJECT

# Enable Cloud SQl and Secret Manager APIs
gcloud services enable sqladmin.googleapis.com secretmanager.googleapis.com

gcloud sql instances describe ${CLOUD_SQL_INSTANCE_NAME}
if [ $? -eq 1 ]; then
  echo "Create Cloud SQL instance with postgreSQL database ..."
  gcloud sql instances create ${CLOUD_SQL_INSTANCE_NAME} \
      --database-version=POSTGRES_12 \
      --region=${GOOGLE_CLOUD_REGION} \
      --cpu=2 \
      --memory=7680MB \
      --root-password=${DB_PASSWORD}
fi

sed -i "s/PROJECT_ID/$GOOGLE_CLOUD_PROJECT/" postgres-secrets.json
sed -i "s/REGION/$GOOGLE_CLOUD_REGION/" postgres-secrets.json
sed -i "s/PASSWORD_SECRET/$DB_PASSWORD/" postgres-secrets.json
sed -i "s/INSTANCE/$CLOUD_SQL_INSTANCE_NAME/" postgres-secrets.json

gcloud secrets describe ${_SECRET_NAME}
if [ $? -eq 1 ]; then
  echo "Creating secret ..."
  gcloud secrets create ${_SECRET_NAME} \
      --replication-policy="automatic"
fi
echo "Adding secret version ..."
gcloud secrets versions add ${_SECRET_NAME} --data-file=postgres-secrets.json

# Create service account
gcloud iam service-accounts create ${_SERVICE_ACCOUNT}
# Allow service account to access secret
gcloud secrets add-iam-policy-binding ${_SECRET_NAME} \
  --member serviceAccount:${_SERVICE_ACCOUNT}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor
  # Allow service account to access Cloud SQL
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT \
   --member serviceAccount:${_SERVICE_ACCOUNT}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
   --role roles/cloudsql.client

gcloud run services update ${K_SERVICE} \
    --platform managed \
    --region ${GOOGLE_CLOUD_REGION} \
    --service-account ${_SERVICE_ACCOUNT}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com \
    --add-cloudsql-instances ${GOOGLE_CLOUD_PROJECT}:${GOOGLE_CLOUD_REGION}:${CLOUD_SQL_INSTANCE_NAME} \
    --set-env-vars CLOUD_SQL_CREDENTIALS_SECRET=projects/${GOOGLE_CLOUD_PROJECT}/secrets/${_SECRET_NAME}/versions/latest
