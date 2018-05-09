<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Create VM with Apache and Custom Homepage

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-compute&page=editor&open_in_editor=samples/startup-script/index.js,samples/startup-script/README.md)

This example shows how to create a VM with Apache and a custom homepage. On creation, the
VM runs the startup script. The startup script installs
Apache and a custom homepage. You can change to script to fit your needs, for example
run a Node.js server on the VM.

### Before you begin

Before running the samples, make sure you've followed the steps in the
[Before you begin section](../../README.md#before-you-begin) of the client
library's README and that your environment variable
`GOOGLE_APPLICATION_CREDENTIALS` is set.

### Run the sample

```
git clone git@github.com:googleapis/nodejs-compute.git
cd nodejs-compute/samples/startup-script
npm install
npm start
```

On success, you should see output like this:

```
npm start

> compute-sample-startup-script@1.0.0 start nodejs-compute/samples/startup-script
> node -e 'require("./index.js").create("vm-with-apache", console.log)'

Booting new VM with IP http://35.202.127.163...
................................. Ready!
null '35.202.127.163'
```

You can test the new VM in your browser by navigating to its IP address.

![Screenshot of homepage][homepage_img]

### Cleanup

Delete the VM you just created by running the following:

```
npm run delete
```

To see all the VMs currently running in your project, run `npm run list` or use the [Cloud Console](https://console.cloud.google.com/compute/instances).


### Troubleshooting

It takes about two minutes to install Apache. If you cannot access the homepage,
connect to the VM and check the log files in `/var/log/syslog`. You can use the [Cloud Console](https://console.cloud.google.com/compute/instance) to connect to a VM or use
the following command:

`gcloud compute --project "YOUR PROJECT ID" ssh --zone "us-central1-a" "vm-with-apache"`

Keep in
mind that the startup script is run as root with a different
home directory than your default user.

[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-compute&page=editor&open_in_editor=samples/startup-script/README.md
[homepage_img]: ./apache.png