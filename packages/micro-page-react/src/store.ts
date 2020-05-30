import { observable, action } from 'mobx';
import MicroPageCore from 'micro-page-core';
import { Field, Page, Template } from 'micro-page-core/es/typings';
import { GetResponseType } from 'micro-page-core/es/utils';

export class EntityStore {
  private _core: MicroPageCore;

  constructor({ core, id }: { core: MicroPageCore; id: string }) {
    this.id = id;
    this._core = core;
  }

  public id: string;

  @observable
  public name?: string;

  @observable
  public desc?: string;

  @observable
  public fields: Field[] = [];

  @observable
  public pages: (Omit<Page, 'source'> & {
    template?: Template;
  })[] = [];

  @observable
  public lastResponse?: GetResponseType<
    ReturnType<MicroPageCore['service']['getEntity']>
  >;

  @action.bound
  loadEntity(
    entity: GetResponseType<ReturnType<MicroPageCore['service']['getEntity']>>,
  ) {
    this.lastResponse = entity;
    this.name = entity.name;
    this.desc = entity.desc;
    const primaryIndex = entity.fields?.findIndex(field => field.primary);
    if (primaryIndex !== undefined && primaryIndex > -1) {
      // 加载的时候把主键放在最前面
      this.fields = [
        entity.fields![primaryIndex],
        ...entity.fields!.slice(0, primaryIndex),
        ...entity.fields!.slice(primaryIndex + 1, entity.fields!.length),
      ];
    } else {
      this.fields = entity.fields || [];
    }
    this.pages =
      entity.pages?.map(page => ({
        ...page,
        template: this._core.config.templates.find(
          template => page.key === template.key,
        ),
      })) || [];
  }

  @action.bound
  setName(name?: string) {
    this.name = name;
  }

  @action.bound
  resetName() {
    this.name = this.lastResponse?.name;
  }

  @action.bound
  setDesc(desc?: string) {
    this.desc = desc;
  }

  @action.bound
  setPrimary(code: string) {
    const prevPrimary = this.fields.find(field => field.primary);
    const nextPrimary = this.fields.find(field => field.code === code);
    if (nextPrimary) {
      nextPrimary.primary = true;
      if (prevPrimary) {
        prevPrimary.primary = false;
      }
    }
  }

  @action.bound
  addPage(page: Omit<Page, 'source'>) {
    this.pages.push({
      ...page,
      template: this._core.config.templates.find(
        template => page.key === template.key,
      ),
    });
  }

  @action.bound
  deletePage(pageId: string) {
    this.pages = this.pages.filter(page => page.id !== pageId);
  }
}
