
echo "hello"
#   gcloud sql instances describe ${_CLOUD_SQL_INSTANCE}
#   if [ $? -eq 1 ]; then
#     gcloud sql instances create ${_CLOUD_SQL_INSTANCE} \
#         --database-version=POSTGRES_12 \
#         --region=${_REGION} \
#         --cpu=2 \
#         --memory=7680MB \
#         --root-password=password1234
#   fi
#
# gcloud secrets describe ${_SECRET_NAME}
# sed -i "s/PROJECT_ID/$PROJECT_ID/" postgres-secrets.json
# if [ $? -eq 1 ]; then
#   gcloud secrets create ${_SECRET_NAME} \
#       --replication-policy="automatic"
# fi
# gcloud secrets versions add ${_SECRET_NAME} --data-file=postgres-secrets.json
#
# # Create service account
# gcloud iam service-accounts create ${_SERVICE_ACCOUNT}
# # Allow service account to access secret
# gcloud secrets add-iam-policy-binding ${_SECRET_NAME} \
#   --member serviceAccount:${_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
#   --role roles/secretmanager.secretAccessor
#   # Allow service account to access Cloud SQL
# gcloud projects add-iam-policy-binding $PROJECT_ID \
#    --member serviceAccount:${_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
#    --role roles/cloudsql.client
#
# gcloud run deploy ${_SERVICE} \
#     --image gcr.io/${PROJECT_ID}/${_SERVICE} \
#     --region ${_REGION} \
#     --allow-unauthenticated \
#     --platform managed \
#     --service-account ${_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
#     --add-cloudsql-instances $PROJECT_ID:${_REGION}:${_CLOUD_SQL_INSTANCE} \
#     --set-env-vars CLOUD_SQL_CREDENTIALS_SECRET=projects/${PROJECT_ID}/secrets/${_SECRET_NAME}/versions/latest


# substitutions:
#   _SERVICE: vote
#   _SECRET_NAME: vote-secrets
#   _SERVICE_ACCOUNT: vote-identity
#   _CLOUD_SQL_INSTANCE: vote-instance
#   _REGION: us-central1
#
#   gcloud run deploy ${_SERVICE} \
#     --image gcr.io/${PROJECT_ID}/${_SERVICE} \
#     --region ${_REGION} \
#     --allow-unauthenticated \
#     --platform managed \
#     --service-account ${_SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
#     --add-cloudsql-instances $PROJECT_ID:${_REGION}:${_CLOUD_SQL_INSTANCE} \
#     --set-env-vars CLOUD_SQL_CREDENTIALS_SECRET=projects/${PROJECT_ID}/secrets/${_SECRET_NAME}/versions/latest
