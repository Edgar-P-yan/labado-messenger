import { Injectable } from '@nestjs/common';
import { ChatsRepository } from './repositories/Chats.repository';
import { Chat } from './entities/Chat.entity';
import { CreateChatDto } from './dto/CreateChat.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';
import { UsersRepository } from '../users/repositories/Users.repository';
import { PersonalChatDto } from './dto/PersonalChat.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepo: ChatsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async createChat(createDto: CreateChatDto): Promise<Chat> {
    const chat = new Chat(createDto);

    await this.chatsRepo.save(chat);

    return chat;
  }

  async editChat(chatId: number | string, editDto: EditChatDto): Promise<Chat> {
    const chat = await this.chatsRepo.findOneOrFailHttp(chatId);

    this.chatsRepo.merge(chat, editDto);
    await this.chatsRepo.save(chat);

    return chat;
  }

  async getChat(chatId: string | number): Promise<Chat> {
    return this.chatsRepo.findOneOrFailHttp(chatId);
  }

  async getAllChats(): Promise<PaginatedChatsDto> {
    const [chats, totalCount] = await this.chatsRepo.findAndCount();

    return new PaginatedChatsDto(chats, totalCount);
  }

  async getPersonalChats(userId: string): Promise<PersonalChatDto[]> {
    const user = await this.usersRepo.findOneOrFailHttp({
      id: userId,
    });

    const chats = await this.chatsRepo
      .createQueryBuilder('chats')
      .leftJoinAndSelect('chats.lastMessage', 'lastMessage')
      .leftJoinAndSelect('chats.firstCompanion', 'firstCompanion')
      .leftJoinAndSelect('chats.secondCompanion', 'secondCompanion')
      .where([{ firstCompanionId: user.id }, { secondCompanionId: user.id }])
      .orderBy('COALESCE(lastMessage.createdAt, chats.createdAt)', 'DESC')
      .getMany();

    const personalChats = PersonalChatDto.createFromChat(chats, user.id);

    return personalChats;
  }
}
