const AWS = require('aws-sdk');
const axios = require('axios');

const serviceName = process.env.SERVICE_NAME;
const url = process.env.URL;

const cloudwatch = new AWS.CloudWatch();

exports.handler = async () => {
	let endTime;
	let requestWasSuccessful;

	const startTime = timeInMs();

	try {
		await axios.get(url);
		requestWasSuccessful = true;
	} catch (error) {
		requestWasSuccessful = false;
	} finally {
		endTime = timeInMs();
	}

	const totalTime = endTime - startTime;

	await Promise.all([
		cloudwatch
			.putMetricData({
				MetricData: [
					{
						MetricName: 'Success',
						Dimensions: [
							{
								Name: 'ServiceName',
								Value: serviceName,
							},
						],
						Unit: 'Count',
						Value: requestWasSuccessful ? 1 : 0,
					},
				],
				Namespace: 'Udacity/Serveless',
			})
			.promise(),
		cloudwatch
			.putMetricData({
				MetricData: [
					{
						MetricName: 'Latency',
						Dimensions: [
							{
								Name: 'ServiceName',
								Value: serviceName,
							},
						],
						Unit: 'Milliseconds',
						Value: totalTime,
					},
				],
				Namespace: 'Udacity/Serveless',
			})
			.promise(),
	]);
};

function timeInMs() {
	return new Date().getTime();
}
