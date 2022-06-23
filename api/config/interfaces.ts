export interface RabbitConfig {

    url: string;

}

export interface NotificationPayload {

    auth: string
    p256dh: string
    endpoint: string
    content: string
    actionName: string
    actionTitle: string
    icon: string
    url1: string
    url2: string

}