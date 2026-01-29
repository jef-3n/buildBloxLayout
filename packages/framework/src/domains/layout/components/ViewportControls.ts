// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createControlToolbarHandlers } from '../handlers/control-toolbar.handlers';

type ViewportControlsData = {
    instanceId?: string;
    context?: unknown;
};

export class ViewportControls extends LitElement {
    @property({ type: String }) orientation = 'row';
    @property({ type: String }) instanceId: string | null = null;
    @property({ attribute: false }) context: unknown = null;
    @property({ attribute: false }) data: ViewportControlsData | null = null;

    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;

    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            this.requestUpdate();
        },
    });

    private handlers = createControlToolbarHandlers(this, () => this.uiDispatch);

    static styles = css`
        :host {
            display: block;
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .controls.column {
            flex-direction: column;
        }

        .viewport-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 24px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #9ca3af;
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .viewport-button:hover {
            color: #ffffff;
            background-color: #374151;
        }

        .viewport-button.active {
            background-color: #2563eb;
            color: #ffffff;
        }

        .viewport-button:disabled {
            color: #4b5563;
            cursor: not-allowed;
            opacity: 0.6;
        }
    `;

    setViewportWidth(requestedMode: string) {
        const mainAreaCount = this.uiState?.layout?.mainAreaCount ?? 1;
        const requestedCount = Number.parseInt(requestedMode, 10);

        const actualMode = requestedCount > mainAreaCount
            ? `${mainAreaCount}x`
            : requestedMode;

        this.handlers.setViewport(actualMode);
    }

    render() {
        const isColumn = this.orientation === 'column';
        const activeViewportWidthMode = this.uiState?.layout?.viewportWidthMode ?? '1x';

        const panels = this.uiState?.panels ?? [];
        const assignedViews = panels
            .filter(p => p.region === 'main')
            .map(p => p.viewId ?? p.activeViewId ?? p.view?.component)
            .filter(Boolean);
        const registeredViewCount = new Set(assignedViews).size;
        const availableViewCount = Math.max(
            registeredViewCount,
            this.uiState?.layout?.mainAreaCount ?? 1
        );

        const allModes = ['1x', '2x', '3x', '4x', '5x'];
        const visibleModes = allModes.slice(0, Math.min(availableViewCount, 5));

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click=${this.handlers.stopClickPropagation}>
                ${visibleModes.map(mode => html`
                    <button
                        @click=${() => this.setViewportWidth(mode)}
                        class="viewport-button ${activeViewportWidthMode === mode ? 'active' : ''}"
                        title="${mode} Viewport Width"
                    >
                        ${mode}
                    </button>
                `)}
            </div>
        `;
    }
}

customElements.define('viewport-controls', ViewportControls);
