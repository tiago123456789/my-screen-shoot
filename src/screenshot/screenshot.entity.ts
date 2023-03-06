import { User } from '../users/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('screen_shoots')
export class ScreenShot {
  @PrimaryGeneratedColumn('uuid')
  private id: string;

  @Column({ type: 'json' })
  private params: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  private user: User;

  @Column({ type: 'timestamp', name: 'created_at' })
  private createdAt: Date;

  @Column({ type: 'timestamp', name: 'updated_at' })
  private updatedAt: Date;

  @Column({ type: 'timestamp', name: 'scheduled_at', nullable: true })
  private scheduledAt: Date;

  @Column({ name: 'webhook_url', nullable: true })
  private webhookUrl: string;

  @Column({ name: 'is_webhook_triggered', default: false })
  private isWebhookTriggered: boolean;

  @Column({ nullable: true })
  private link: string;

  @BeforeInsert()
  private setTimeStamps() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public getParams(): string {
    return this.params;
  }

  public setParams(params: string): void {
    this.params = params;
  }

  public getUser(): User {
    return this.user;
  }

  public setUser(user: User): void {
    this.user = user;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  public getScheduledAt(): Date {
    return this.scheduledAt;
  }

  public setScheduledAt(scheduledAt: Date): void {
    this.scheduledAt = scheduledAt;
  }

  public getWebhookUrl(): string {
    return this.webhookUrl;
  }

  public setWebhookUrl(webhookUrl: string): void {
    this.webhookUrl = webhookUrl;
  }

  public getLink(): string {
    return this.link;
  }

  public setLink(link: string): void {
    this.link = link;
  }

  public isIsWebhookTriggered(): boolean {
    return this.isWebhookTriggered;
  }

  public setIsWebhookTriggered(isWebhookTriggered: boolean): void {
    this.isWebhookTriggered = isWebhookTriggered;
  }
}
