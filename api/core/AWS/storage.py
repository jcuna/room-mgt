from botocore.exceptions import ClientError

from core.AWS.base import Base
from core.utils import get_logger

class Storage(Base):

    def __init__(self, bucket, resource='s3'):
        super().__init__()
        self.bucket = bucket
        self.app_logger = get_logger('app')
        if resource not in self.clients:
            self.clients.update({resource: self.session['session'].client(resource)})

    def get_file(self, object_name):
        return self.get_client().get_object(Bucket=self.bucket, Key=object_name)

    def put_new(self, body, object_name, content_type=None):
        if hasattr(body, 'content_type'):
            content_type = body.content_type
        elif not content_type:
            content_type = 'binary/octet-stream'
        return self.get_client().put_object(Body=body, Bucket=self.bucket, Key=object_name, ContentType=content_type)

    def remove(self, name):
        s3 = self.session['session'].resource('s3')
        s3.Object(self.bucket, name).delete()

    def get_all_objects(self, prefix=''):
        resources = self.session['session'].client('s3').list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        return resources['Contents']

    def get_bucket(self, bucket):
        s3 = self.session['session'].resource('s3')
        return s3.Bucket(bucket)

    def sign_url(self, object_name, expiration=14400):
        """Generate a presigned URL to share an S3 object

        :param object_name: string
        :param expiration: Time in seconds for the presigned URL to remain valid
        :return: Presigned URL as string. If error, returns None.
            """
        try:
            response = self.get_client().generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': object_name},
                ExpiresIn=expiration
            )
        except ClientError as e:
            self.app_logger.error(e)
            return None

        # The response contains the presigned URL
        return response

    def upload_file(self, file_name, object_name):
        """Upload a file to an S3 bucket

        :param file_name: File to upload
        :param object_name: S3 object name. If not specified then file_name is used
        :return: True if file was uploaded, else False
        """
        try:
            response = self.get_client().upload_file(file_name, self.bucket, object_name)
        except ClientError as e:
            self.app_logger.error(e)
            return False
        return response
