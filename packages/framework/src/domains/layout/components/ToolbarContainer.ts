import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import '../../workspace/components/PanelView';

type ToolbarContext = {
    viewIds?: string[];
};

type ToolbarContainerData = {
    instanceId?: string;
    context?: ToolbarContext;
    viewIds?: string[];
};

export class ToolbarContainer extends LitElement {
    @property({ type: String }) instanceId: string | null = null;
    @property({ attribute: false }) context: ToolbarContext | null = null;
    @property({ attribute: false }) data: ToolbarContainerData | null = null;

    static styles = css`
        :host {
            display: block;
        }

        .toolbar {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            width: 100%;
        }

        panel-view {
            flex: 1 1 auto;
            min-width: 0;
        }
    `;

    private resolveContext(): ToolbarContext | null {
        if (this.context) {
            return this.context;
        }

        const data = this.data;
        if (data && typeof data === 'object') {
            if (data.context && typeof data.context === 'object') {
                return data.context;
            }
            if (Array.isArray(data.viewIds)) {
                return { viewIds: data.viewIds };
            }
        }

        return null;
    }

    render() {
        const viewIds = this.resolveContext()?.viewIds ?? [];

        return html`
            <div class="toolbar">
                ${viewIds.map((viewId) => html`
                    <panel-view .viewId=${viewId}></panel-view>
                `)}
            </div>
        `;
    }
}

customElements.define('toolbar-container', ToolbarContainer);
