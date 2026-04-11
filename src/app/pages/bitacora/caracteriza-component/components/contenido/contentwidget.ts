import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';

import { ContentService } from '../../../../../core/services/content.service';
import { Topic } from '../../../../../core/models/topic.model';
import { Subtopic } from '../../../../../core/models/subtopic.model';

@Component({
    selector: 'app-contentwidget',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        ToolbarModule,
        DialogModule,
        ConfirmDialogModule,
        AutoComplete
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './contentwidget.html'
})
export class Contentwidget implements OnInit {
    @Output() recordCount = new EventEmitter<number>();

    topics: Topic[] = [];
    subtopics: Subtopic[] = [];
    selectedTopic: Topic | null = null;
    filteredTopics: Topic[] = [];

    topic: Topic = { id: 0, name: '' };
    subtopic: Subtopic = { id: 0, topicId: 0, name: '' };

    submitted = false;
    topicDialog = false;
    subtopicDialog = false;

    constructor(
        private contentService: ContentService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadData();
    }
    tableRows: any[] = [];

    loadData() {
        this.contentService.getTopics().subscribe(topics => {
            this.topics = topics;
            this.recordCount.emit(this.topics.length);

            this.contentService.getSubtopics().subscribe(subtopics => {
                this.subtopics = subtopics;

                // Construir tabla: todos los temas, aunque no tengan subtemas
                this.tableRows = [];

                this.topics.forEach(topic => {
                    const subs = this.subtopics.filter(s => s.topicId === topic.id);
                    if (subs.length) {
                        // Si hay subtemas, agregarlos
                        subs.forEach((sub, idx) => {
                            this.tableRows.push({
                                topic,
                                subtopic: sub,
                                isFirstSub: idx === 0,
                                rowspan: subs.length
                            });
                        });
                    } else {
                        // Si no hay subtemas, se agrega subtopic null
                        this.tableRows.push({
                            topic,
                            subtopic: null,
                            isFirstSub: true,
                            rowspan: 1
                        });
                    }
                });
            });
        });
    }


    // --- Abrir diálogos ---
    openNewTopic() {
        this.topic = { id: 0, name: '' };
        this.submitted = false;
        this.topicDialog = true;
    }

    openNewSubtopic() {
        if (!this.topics.length) return; // No se puede crear subtema si no hay temas
        this.subtopic = { id: 0, topicId: this.topics[0].id, name: '' };
        this.submitted = false;
        this.subtopicDialog = true;
    }

    editTopicDialog(topic: Topic) {
        this.topic = { ...topic };
        this.submitted = false;
        this.topicDialog = true;
    }

    editSubtopicDialog(subtopic: Subtopic) {
        this.subtopic = { ...subtopic };
        this.submitted = false;
        this.subtopicDialog = true;
    }

    // --- Guardar ---
    saveTopic() {
        this.submitted = true;
        if (!this.topic.name.trim()) {
            this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre del tema es obligatorio' });
            return;
        }

        if (this.topic.id === 0) {
            this.contentService.addTopic(this.topic.name.trim());
            this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Tema creado correctamente' });
        } else {
            this.contentService.editTopic(this.topic.id, this.topic.name.trim());
            this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Tema actualizado correctamente' });
        }

        this.topicDialog = false;
        this.topic = { id: 0, name: '' };
        this.submitted = false;
        this.loadData();
    }

    saveSubtopic() {
        this.submitted = true;

        if (!this.subtopic.name.trim() || !this.selectedTopic) return;

        const topicId = this.selectedTopic.id;

        if (this.subtopic.id === 0) {
            this.contentService.addSubtopic(this.subtopic.name.trim(), topicId);
        } else {
            this.contentService.editSubtopic(this.subtopic.id, this.subtopic.name.trim(), topicId);
        }

        this.subtopicDialog = false;
        this.subtopic = { id: 0, name: '', topicId: 0 };
        this.selectedTopic = null;
        this.submitted = false;
        this.loadData();
    }

    deleteTopic(id: number) {
        const topic = this.topics.find(t => t.id === id);
        const subtopicCount = this.subtopics.filter(s => s.topicId === id).length;
        const subtopicWarning = subtopicCount > 0
            ? ` También se eliminarán los <strong>${subtopicCount} subtema(s)</strong> asociado(s).`
            : '';

        this.confirmationService.confirm({
            message: `¿Deseas eliminar el tema <strong>${topic?.name}</strong>?${subtopicWarning}`,
            header: 'Eliminar tema',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.contentService.deleteTopic(id);
                this.loadData();
            }
        });
    }

    deleteSubtopic(id: number) {
        const subtopic = this.subtopics.find(s => s.id === id);

        this.confirmationService.confirm({
            message: `¿Deseas eliminar el subtema <strong>${subtopic?.name}</strong>?`,
            header: 'Eliminar subtema',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.contentService.deleteSubtopic(id);
                this.loadData();
            }
        });
    }

    hideTopicDialog() {
        this.topicDialog = false;
        this.submitted = false;
    }

    hideSubtopicDialog() {
        this.subtopicDialog = false;
        this.submitted = false;
    }
    filterTopics(event: any) {
        const query = event.query.toLowerCase();
        this.filteredTopics = this.topics.filter(t => t.name.toLowerCase().includes(query));
    }

}
