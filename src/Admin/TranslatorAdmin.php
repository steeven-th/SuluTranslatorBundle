<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle\Admin;

use Sulu\Bundle\AdminBundle\Admin\Admin;
use Sulu\Bundle\AdminBundle\Admin\Navigation\NavigationItem;
use Sulu\Bundle\AdminBundle\Admin\Navigation\NavigationItemCollection;
use Sulu\Bundle\AdminBundle\Admin\View\ViewBuilderFactoryInterface;
use Sulu\Bundle\AdminBundle\Admin\View\ViewCollection;
use Sulu\Bundle\AdminBundle\Admin\View\ToolbarAction;
use Sulu\Component\Security\Authorization\PermissionTypes;
use Sulu\Component\Security\Authorization\SecurityCheckerInterface;

/**
 * Registers the translator toolbar actions and admin views in Sulu.
 *
 * Adds a "Translate all" bulk action to the page and article edit forms,
 * and registers a settings view for DeepL usage statistics.
 * Access to the settings view is controlled by the security context.
 */
class TranslatorAdmin extends Admin
{
    public const SECURITY_CONTEXT = 'sulu.settings.translator';
    public const PAGE_EDIT_VIEW = 'sulu_page.page_edit_form.content';
    public const CONFIG_VIEW = 'itech_world.translator.config';

    /**
     * @param ViewBuilderFactoryInterface $viewBuilderFactory The Sulu view builder factory
     * @param SecurityCheckerInterface    $securityChecker    The Sulu security checker
     */
    public function __construct(
        private ViewBuilderFactoryInterface $viewBuilderFactory,
        private SecurityCheckerInterface $securityChecker,
    ) {}

    /**
     * Adds a "DeepL Translator" item in the Settings navigation menu.
     *
     * Only visible if the user has VIEW permission on the translator security context.
     *
     * @param NavigationItemCollection $navigationItemCollection The navigation collection
     */
    public function configureNavigationItems(NavigationItemCollection $navigationItemCollection): void
    {
        if ($this->securityChecker->hasPermission(static::SECURITY_CONTEXT, PermissionTypes::VIEW)) {
            $translatorItem = new NavigationItem('itech_world.translator.settings_title');
            $translatorItem->setPosition(50);
            $translatorItem->setView(self::CONFIG_VIEW);

            $navigationItemCollection->get(Admin::SETTINGS_NAVIGATION_ITEM)->addChild($translatorItem);
        }
    }

    /**
     * Configures the Sulu admin views for the translator bundle.
     *
     * Adds the bulk translate toolbar action to the page and article edit forms,
     * and a settings view for DeepL usage statistics (if user has VIEW permission).
     *
     * @param ViewCollection $viewCollection The view collection to configure
     */
    public function configureViews(ViewCollection $viewCollection): void
    {
        // Add DeepL usage statistics settings view (permission-gated)
        if ($this->securityChecker->hasPermission(static::SECURITY_CONTEXT, PermissionTypes::VIEW)) {
            $viewCollection->add(
                $this->viewBuilderFactory->createViewBuilder(
                    self::CONFIG_VIEW,
                    '/translator',
                    self::CONFIG_VIEW
                )->setOption('tabTitle', 'itech_world.translator.settings_title')
            );
        }

        // Add toolbar action to page edit form
        try {
            $pageView = $viewCollection->get(self::PAGE_EDIT_VIEW);
            $existingToolbarActions = $pageView->getView()->getOption('toolbarActions') ?? [];
            $existingToolbarActions[] = new ToolbarAction('itech_world.translator.bulk_translate');
            $pageView->setOption('toolbarActions', $existingToolbarActions);
            $viewCollection->add($pageView);
        } catch (\Exception) {
            // View not available - SuluPageBundle may not be installed
        }

        // Add toolbar action to article edit form (if sulu_article bundle is installed)
        try {
            $articleEditView = $viewCollection->get('sulu_article.edit_form.details');
            $existingArticleToolbarActions = $articleEditView->getView()->getOption('toolbarActions') ?? [];
            $existingArticleToolbarActions[] = new ToolbarAction('itech_world.translator.bulk_translate');
            $articleEditView->setOption('toolbarActions', $existingArticleToolbarActions);
            $viewCollection->add($articleEditView);
        } catch (\Exception) {
            // View not available - SuluArticleBundle may not be installed
        }
    }

    /**
     * Returns the security contexts for the translator bundle.
     *
     * Registers a "Translator" permission under Settings,
     * allowing role-based access control to the DeepL statistics page.
     *
     * @return array<string, array<string, array<string, list<string>>>> Security contexts
     */
    public function getSecurityContexts(): array
    {
        return [
            self::SULU_ADMIN_SECURITY_SYSTEM => [
                'Settings' => [
                    static::SECURITY_CONTEXT => [
                        PermissionTypes::VIEW,
                    ],
                ],
            ],
        ];
    }
}
