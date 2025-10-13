import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Topic } from '../models/topic.model';
import { Subtopic } from '../models/subtopic.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
    private topicsSubject = new BehaviorSubject<Topic[]>([
        { id: 1, name: 'Tema 1' },
        { id: 2, name: 'Tema 2' }
    ]);
    topics$ = this.topicsSubject.asObservable();

    private subtopicsSubject = new BehaviorSubject<Subtopic[]>([
        { id: 1, name: 'Introducción', topicId: 1 },
        { id: 2, name: 'Variables', topicId: 1 },
        { id: 3, name: 'Funciones', topicId: 2 }
    ]);
    subtopics$ = this.subtopicsSubject.asObservable();

    constructor() { }

    // Obtener topics
    getTopics(): Observable<Topic[]> {
        return this.topics$;
    }

    // Obtener subtopics con referencia al topic
    getSubtopics(): Observable<Subtopic[]> {
        return combineLatest([this.subtopics$, this.topics$]).pipe(
            map(([subs, topics]) =>
                subs.map(s => ({ ...s, topic: topics.find(t => t.id === s.topicId)! }))
            )
        );
    }

    addTopic(name: string) {
        const topics = this.topicsSubject.getValue();
        const id = topics.length ? Math.max(...topics.map(t => t.id)) + 1 : 1;
        this.topicsSubject.next([...topics, { id, name }]);
    }

    editTopic(id: number, name: string) {
        const topics = this.topicsSubject.getValue();
        const topic = topics.find(t => t.id === id);
        if (topic) {
            topic.name = name;
            this.topicsSubject.next([...topics]);
        }
    }

    deleteTopic(id: number) {
        const topics = this.topicsSubject.getValue().filter(t => t.id !== id);
        const subtopics = this.subtopicsSubject.getValue().filter(s => s.topicId !== id);
        this.topicsSubject.next([...topics]);
        this.subtopicsSubject.next([...subtopics]);
    }

    addSubtopic(name: string, topicId: number) {
        const subs = this.subtopicsSubject.getValue();
        const id = subs.length + 1;
        this.subtopicsSubject.next([...subs, { id, name, topicId }]);
    }

    editSubtopic(id: number, name: string, topicId: number) {
        const subs = this.subtopicsSubject.getValue();
        const sub = subs.find(s => s.id === id);
        if (sub) {
            sub.name = name;
            sub.topicId = topicId;
            this.subtopicsSubject.next([...subs]);
        }
    }

    deleteSubtopic(id: number) {
        const subs = this.subtopicsSubject.getValue().filter(s => s.id !== id);
        this.subtopicsSubject.next([...subs]);
    }
}
