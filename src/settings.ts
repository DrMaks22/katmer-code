import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type ClaudeNativePlugin from "./main";
import { SKILL_CATALOG, CATEGORY_LABEL_KEYS, type ModelChoice, type PermissionMode } from "./types";
import { formatCount, t } from "./i18n";

export class ClaudeNativeSettingTab extends PluginSettingTab {
  plugin: ClaudeNativePlugin;

  constructor(app: App, plugin: ClaudeNativePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t("settings.cliPath.name"))
      .setDesc(t("settings.cliPath.desc"))
      .addText((text) =>
        text
          .setPlaceholder(t("settings.cliPath.placeholder"))
          .setValue(this.plugin.settings.cliPath)
          .onChange((value) => {
            this.plugin.settings.cliPath = value;
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.workingDirectory.name"))
      .setDesc(t("settings.workingDirectory.desc"))
      .addText((text) =>
        text
          .setPlaceholder(t("settings.workingDirectory.placeholder"))
          .setValue(this.plugin.settings.workingDirectory)
          .onChange((value) => {
            this.plugin.settings.workingDirectory = value;
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.defaultModel.name"))
      .setDesc(t("settings.defaultModel.desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            "opus[1m]": `${t("app.model.opus1m.label")} (${t("app.model.opus1m.description")})`,
            opus: `${t("app.model.opus.label")} (${t("app.model.opus.description")})`,
            sonnet: `${t("app.model.sonnet.label")} (${t("app.model.sonnet.description")})`,
            haiku: `${t("app.model.haiku.label")} (${t("app.model.haiku.description")})`,
          })
          .setValue(this.plugin.settings.defaultModel)
          .onChange((value) => {
            this.plugin.settings.defaultModel = value as ModelChoice;
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.permissionMode.name"))
      .setDesc(t("settings.permissionMode.desc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            default: t("settings.permissionMode.option.default"),
            acceptEdits: t("settings.permissionMode.option.acceptEdits"),
            bypassPermissions: t("settings.permissionMode.option.bypassPermissions"),
          })
          .setValue(this.plugin.settings.permissionMode)
          .onChange((value) => {
            this.plugin.settings.permissionMode = value as PermissionMode;
            void this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t("settings.allowWebRequests.name"))
      .setDesc(t("settings.allowWebRequests.desc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.allowWebRequests).onChange((value) => {
          this.plugin.settings.allowWebRequests = value;
          void this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("settings.showToolCalls.name"))
      .setDesc(t("settings.showToolCalls.desc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showToolCalls).onChange((value) => {
          this.plugin.settings.showToolCalls = value;
          void this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName(t("settings.showCostInfo.name"))
      .setDesc(t("settings.showCostInfo.desc"))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showCostInfo).onChange((value) => {
          this.plugin.settings.showCostInfo = value;
          void this.plugin.saveSettings();
        })
      );

    // ── Skills ──
    new Setting(containerEl).setName(t("settings.skills.heading")).setHeading();
    containerEl.createEl("p", {
      text: t("settings.skills.desc"),
      cls: "setting-item-description katmer-skills-desc",
    });

    // Bulk actions
    new Setting(containerEl)
      .setName(t("settings.bulkActions.heading"))
      .addButton((btn) =>
        btn.setButtonText(t("settings.bulkActions.enableAll")).onClick(() => {
          this.plugin.settings.enabledSkills = SKILL_CATALOG.map(s => s.id);
          if (!this.plugin.settings.allowWebRequests) {
            this.plugin.settings.allowWebRequests = true;
            new Notice(t("settings.notice.skillsEnabledWithWeb", { count: formatCount(SKILL_CATALOG.length, t("count.skill.one"), t("count.skill.few"), t("count.skill.many")) }));
          } else {
            new Notice(t("settings.notice.skillsEnabled", { count: formatCount(SKILL_CATALOG.length, t("count.skill.one"), t("count.skill.few"), t("count.skill.many")) }));
          }
          void this.plugin.saveSettings();
          this.plugin.syncSkills();
          this.display();
        })
      )
      .addButton((btn) =>
        btn.setButtonText(t("settings.bulkActions.disableAll")).onClick(() => {
          this.plugin.settings.enabledSkills = [];
          void this.plugin.saveSettings();
          this.plugin.syncSkills();
          new Notice(t("settings.notice.skillsDisabled"));
          this.display();
        })
      );

    // Group by category
    const categories = [...new Set(SKILL_CATALOG.map(s => s.category))];

    for (const cat of categories) {
      const skills = SKILL_CATALOG.filter(s => s.category === cat);
      const label = t(CATEGORY_LABEL_KEYS[cat] || cat);

      new Setting(containerEl).setName(label).setHeading();

      for (const skill of skills) {
        const enabled = this.plugin.settings.enabledSkills.includes(skill.id);

        new Setting(containerEl)
          .setName(skill.name)
          .setDesc(t(skill.descriptionKey))
          .addToggle((toggle) =>
            toggle.setValue(enabled).onChange((value) => {
              if (value) {
                if (!this.plugin.settings.enabledSkills.includes(skill.id)) {
                  this.plugin.settings.enabledSkills.push(skill.id);
                }
                // Warn if web access not enabled (most skills need it)
                if (!this.plugin.settings.allowWebRequests && skill.id !== "abstract" && skill.id !== "report-template") {
                  new Notice(t("settings.notice.skillWebApis"), 8000);
                }
              } else {
                this.plugin.settings.enabledSkills =
                  this.plugin.settings.enabledSkills.filter(id => id !== skill.id);
              }
              void this.plugin.saveSettings();
              this.plugin.syncSkills();
            })
          );
      }
    }
  }
}
