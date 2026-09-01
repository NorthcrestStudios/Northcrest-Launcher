import { apiClient } from "../api/client";


export interface NorthcrestMessage
{
    Id: string;
    SenderAccountId: string;
    ReceiverAccountId: string;
    Content: string;
    CreatedAt: string;
    ReadAt: string | null;
}


export interface NorthcrestConversation
{
    FriendId: string;
    Username: string;
    Avatar: string | null;
    LastMessage: string | null;
    LastMessageAt: string | null;
    UnreadCount: number;
}


interface ConversationsResponse
{
    conversations:
        NorthcrestConversation[];
}


interface MessagesResponse
{
    messages:
        NorthcrestMessage[];
}


interface SendMessageResponse
{
    message:
        NorthcrestMessage;
}


export async function GetConversations()
{
    const Response =
        await apiClient.get<ConversationsResponse>(
            "/messages/conversations"
        );

    return Response.conversations;
}


export async function GetConversation(
    FriendId: string
)
{
    const Response =
        await apiClient.get<MessagesResponse>(
            `/messages/${encodeURIComponent(FriendId)}`
        );

    return Response.messages;
}


export async function SendMessage(
    ReceiverAccountId: string,
    Content: string
)
{
    const Response =
        await apiClient.post<SendMessageResponse>(
            "/messages",
            {
                ReceiverAccountId,
                Content
            }
        );

    return Response.message;
}