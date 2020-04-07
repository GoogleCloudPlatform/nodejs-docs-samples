# [Node sample for Cloud Composer-Dataflow Tutorial][tutorial-link]

This is the code for the transform CSV-to-JSON code sample for the [Using the DataflowTemplateOperator][tutorial-link] tutorial.

This tutorial how to use the DataflowTemplateOperator to launch Dataflow Pipelines from Cloud Composer. The Cloud Storage Text to BigQuery (Stream) pipeline is a streaming pipeline that allows you to stream text files stored in Cloud Storage, transform them using a JavaScript User Defined Function (UDF) that you provide, and output the results to BigQuery.

* This code is a User Defined Function written in JavaScript that will transform each line of a .txt file into the relevant columns for a BigQuery table.

[tutorial-link]: https://cloud.devsite.corp.google.com/composer/docs/how-to/using/using-dataflow-template-operator?auto_signin=false
