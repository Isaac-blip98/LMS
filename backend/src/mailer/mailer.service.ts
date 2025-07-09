import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly mailerService: NestMailerService) {}

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Welcome to LearningHub!',
        template: 'welcome',
        context: { name },
      });
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendVerificationCodeEmail(to: string, code: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'LearningHub Password Reset Code',
        template: 'reset-password',
        context: {
          name,
          code,
        },
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendCertificateIssuedEmail(to: string, name: string, courseTitle: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Your LearningHub Certificate is Ready!',
        template: 'certificate-issued',
        context: {
          name,
          courseTitle,
        },
      });
      this.logger.log(`Certificate email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send certificate email to ${to}:`, error);
      throw new Error(`Failed to send certificate issued email: ${error.message}`);
    }
  }

  async sendResetPasswordEmail(to: string, code: string): Promise<void> {
    // For compatibility, just call sendVerificationCodeEmail with a generic name
    await this.sendVerificationCodeEmail(to, code, 'User');
  }

  async sendEnrollmentConfirmationEmail(to: string, name: string, courseTitle: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `Enrollment Confirmation for ${courseTitle}`,
        template: 'enrollment-confirmation',
        context: { name, courseTitle },
      });
      this.logger.log(`Enrollment confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send enrollment confirmation email to ${to}:`, error);
      throw new Error(`Failed to send enrollment confirmation email: ${error.message}`);
    }
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: 'test@example.com',
        subject: 'LearningHub Email Test',
        text: 'This is a test email from LearningHub to verify mail configuration.',
      });
      this.logger.log('Test email sent successfully');
      return true;
    } catch (error) {
      this.logger.error('Email configuration test failed:', error);
      return false;
    }
  }
}
