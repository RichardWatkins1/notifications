const {sendMessage} = require("../src/sendMessage")
const { v4 } = require("uuid")
const nock = require("nock")

const sqsRecordBuilder = body => {
  return {
    Records: [{
      messageId: v4(),
      receiptHandle: "MessageReceiptHandle",
      body: JSON.stringify(body),
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: "1523232000000",
        SenderId: "123456789012",
        ApproximateFirstReceiveTimestamp: "1523232000001",
      },
      messageAttributes: {},
      md5OfBody: "{{{md5_of_body}}}",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
      awsRegion: "us-east-1",
    }]
  }
}



describe("sendMessage", () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });
  afterEach(() => {
    nock.cleanAll();
  });
  
  describe("sending an email", () => {
    it("sends an email when given a valid payload", async () => {
      const messageBody = {
        firstName: "Richard",
        lastName: "test",
        dob: "01/01/1990",
        email: "test@example.com",
        messageType: "email"
      }
      const sqsEvent = sqsRecordBuilder(messageBody)

      const sesNock = nock("https://email.eu-west-1.amazonaws.com:443")
      .post("/")
      .times(1)
      .reply(200);

      const response = await sendMessage(sqsEvent)

      expect(response).toEqual({
        message: "sent email notification to Richard test"
      })
      expect(sesNock.isDone()).toEqual(true)
    })
  })
}) 