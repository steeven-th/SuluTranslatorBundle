<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle\Service;

use DeepL\Translator;
use DeepL\DeepLException;

/**
 * Wrapper service around the DeepL PHP client.
 *
 * Provides text translation and API usage statistics
 * for the Sulu admin translation feature.
 */
class DeeplTranslationService
{
    private Translator $translator;

    /**
     * @param string $deeplApiKey The DeepL API authentication key
     *
     * @throws DeepLException If the API key is invalid or the client cannot be initialized
     */
    public function __construct(string $deeplApiKey)
    {
        $this->translator = new Translator($deeplApiKey);
    }

    /**
     * Translates the given text to the target language.
     *
     * Uses HTML tag handling to preserve markup from text_editor fields.
     * Source language is auto-detected when null.
     *
     * @param string      $text   The text content to translate
     * @param string|null $source The source language code (null for auto-detection)
     * @param string      $target The target language code (e.g. "en-GB", "fr", "de")
     *
     * @return string The translated text
     *
     * @throws DeepLException If the translation request fails
     */
    public function translateText(string $text, ?string $source, string $target): string
    {
        $result = $this->translator->translateText(
            $text,
            $source,
            $target,
            ['tag_handling' => 'html']
        );

        return $result->text;
    }

    /**
     * Retrieves the current DeepL API usage statistics.
     *
     * @return array{character_count: int, character_limit: int} Usage data with character counts
     *
     * @throws DeepLException If the usage request fails
     */
    public function getUsage(): array
    {
        $usage = $this->translator->getUsage();

        return [
            'character_count' => $usage->character->count,
            'character_limit' => $usage->character->limit,
        ];
    }
}
