import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Topic } from '../models/topic.model';
import { Subtopic } from '../models/subtopic.model';

@Injectable({ providedIn: 'root' })
export class ContentService {
    private topicsSubject = new BehaviorSubject<Topic[]>([]);
    topics$ = this.topicsSubject.asObservable();

    private subtopicsSubject = new BehaviorSubject<Subtopic[]>([]);
    subtopics$ = this.subtopicsSubject.asObservable();

    /** Emite cuando los datos cambian por operaciones CRUD (no en carga inicial) */
    private dataChanged = new Subject<void>();
    dataChanged$ = this.dataChanged.asObservable();

    constructor() { }

    /**
     * Carga datos desde el JSON guardado en base de datos.
     * NO emite dataChanged$ para evitar disparar auto-save en la carga inicial.
     */
    loadFromData(data: { topics?: Topic[], subtopics?: Subtopic[] }): void {
        if (data?.topics) this.topicsSubject.next(data.topics);
        if (data?.subtopics) this.subtopicsSubject.next(data.subtopics);
    }

    /** Retorna el estado actual para incluir en el JSON de guardado */
    getData(): { topics: Topic[], subtopics: Subtopic[] } {
        return {
            topics: this.topicsSubject.getValue(),
            subtopics: this.subtopicsSubject.getValue()
        };
    }

    getTopics(): Observable<Topic[]> {
        return this.topics$;
    }

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
        this.dataChanged.next();
    }

    editTopic(id: number, name: string) {
        const topics = this.topicsSubject.getValue();
        const topic = topics.find(t => t.id === id);
        if (topic) {
            topic.name = name;
            this.topicsSubject.next([...topics]);
            this.dataChanged.next();
        }
    }

    deleteTopic(id: number) {
        const topics = this.topicsSubject.getValue().filter(t => t.id !== id);
        const subtopics = this.subtopicsSubject.getValue().filter(s => s.topicId !== id);
        this.topicsSubject.next([...topics]);
        this.subtopicsSubject.next([...subtopics]);
        this.dataChanged.next();
    }

    addSubtopic(name: string, topicId: number) {
        const subs = this.subtopicsSubject.getValue();
        const id = subs.length ? Math.max(...subs.map(s => s.id)) + 1 : 1;
        this.subtopicsSubject.next([...subs, { id, name, topicId }]);
        this.dataChanged.next();
    }

    editSubtopic(id: number, name: string, topicId: number) {
        const subs = this.subtopicsSubject.getValue();
        const sub = subs.find(s => s.id === id);
        if (sub) {
            sub.name = name;
            sub.topicId = topicId;
            this.subtopicsSubject.next([...subs]);
            this.dataChanged.next();
        }
    }

    deleteSubtopic(id: number) {
        const subs = this.subtopicsSubject.getValue().filter(s => s.id !== id);
        this.subtopicsSubject.next([...subs]);
        this.dataChanged.next();
    }
}
