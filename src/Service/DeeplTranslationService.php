<?php

declare(strict_types=1);

namespace ItechWorld\SuluTranslatorBundle\Service;

use DeepL\Translator;
use DeepL\DeepLException;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Wrapper service around the DeepL PHP client.
 *
 * Provides text translation and API usage statistics
 * for the Sulu admin translation feature.
 */
class DeeplTranslationService
{
    private Translator $translator;
    private string $deeplApiKey;
    private HttpClientInterface $httpClient;

    /**
     * @param string              $deeplApiKey The DeepL API authentication key
     * @param HttpClientInterface $httpClient  The Symfony HTTP client for raw API calls
     *
     * @throws DeepLException If the API key is invalid or the client cannot be initialized
     */
    public function __construct(string $deeplApiKey, HttpClientInterface $httpClient)
    {
        $this->deeplApiKey = $deeplApiKey;
        $this->translator = new Translator($deeplApiKey);
        $this->httpClient = $httpClient;
    }

    /**
     * Translates the given text to the target language.
     *
     * When $isHtml is true, uses HTML tag handling to preserve markup
     * from text_editor fields. For plain text fields (text_line, text_area),
     * no tag handling is applied to avoid HTML entity encoding.
     *
     * @param string      $text   The text content to translate
     * @param string|null $source The source language code (null for auto-detection)
     * @param string      $target The target language code (e.g. "en-GB", "fr", "de")
     * @param bool        $isHtml Whether the content contains HTML markup
     *
     * @return string The translated text
     *
     * @throws DeepLException If the translation request fails
     */
    public function translateText(string $text, ?string $source, string $target, bool $isHtml = false): string
    {
        $options = [];
        if ($isHtml) {
            $options['tag_handling'] = 'html';
        }

        $result = $this->translator->translateText(
            $text,
            $source,
            $target,
            $options
        );

        return $result->text;
    }

    /**
     * Retrieves the current DeepL API usage statistics.
     *
     * Uses the raw DeepL API to get additional fields (start_time, end_time)
     * not exposed by the PHP library. Falls back to the library for basic usage.
     *
     * @return array{
     *     character_count: int,
     *     character_limit: int,
     *     account_type: string,
     *     start_time: string|null,
     *     end_time: string|null
     * } Usage data with character counts, account type and billing period
     *
     * @throws DeepLException If the usage request fails
     */
    public function getUsage(): array
    {
        $isFree = Translator::isAuthKeyFreeAccount($this->deeplApiKey);
        $baseUrl = $isFree
            ? 'https://api-free.deepl.com'
            : 'https://api.deepl.com';

        $response = $this->httpClient->request('GET', $baseUrl . '/v2/usage', [
            'headers' => [
                'Authorization' => 'DeepL-Auth-Key ' . $this->deeplApiKey,
            ],
        ]);

        $data = $response->toArray();

        return [
            'character_count' => $data['character_count'] ?? 0,
            'character_limit' => $data['character_limit'] ?? 0,
            'account_type' => $isFree ? 'free' : 'pro',
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
        ];
    }
}
