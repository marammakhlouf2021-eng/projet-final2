import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarEtudiantComponent } from '../sidebar-etudiant/sidebar-etudiant.component';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    SidebarEtudiantComponent
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  userInput = '';
  isTyping = false;
  etudiant: any = null;

  messages: Message[] = [
    { text: 'Bonjour ! Comment puis-je vous aider ? Vous pouvez me demander vos notes, absences, retards, moyennes ou emploi du temps.', sender: 'bot' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const data = localStorage.getItem('etudiant');
    if (data) this.etudiant = JSON.parse(data);
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isTyping) return;

    this.messages.push({ text, sender: 'user' });
    this.userInput = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.http.post<{ reply: string }>('http://localhost:3000/chat-etudiant', {
      message: text,
      etudiantId: this.etudiant?._id
    }).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({ text: res.reply, sender: 'bot' });
        this.scrollToBottom();
      },
      error: () => {
        this.isTyping = false;
        this.messages.push({ text: 'Désolé, une erreur est survenue.', sender: 'bot' });
        this.scrollToBottom();
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.sendMessage();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}