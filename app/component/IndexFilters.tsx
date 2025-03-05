import {
    
    IndexTable,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    useIndexResourceState,
    Text,
    ChoiceList,
    RangeSlider,
} from '@shopify/polaris';
import type { IndexFiltersProps, TabProps } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import _ from 'lodash';
import { useNavigate } from '@remix-run/react';

export const IndexFiltersDefaultExample = ({ products }) => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const [itemStrings, setItemStrings] = useState(['All']);
    const [selected, setSelected] = useState(0);
    const navigate = useNavigate();
    const handleSortChange = useCallback((value: string[]) => {
        console.log('Sort by:', value);
        setSortSelected(value);
      
        const params = new URLSearchParams(window.location.search);
        params.set('sort', value.join(','));
        console.log('Navigating to:', `?${params.toString()}`);
        navigate(`?${params.toString()}`);
      }, [navigate]);
      
    const tabs: TabProps[] = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
        isLocked: index === 0,
    }));
    const handleFiltersQueryChange = useCallback((value: string) => {
        setQueryValue(value);
        debounceSearch(value);
      }, []);
      
      const debounceSearch = useCallback(
        _.debounce((value: string) => {
          console.log("Debounced search:", value);
          setQueryValue(value);
          const params = new URLSearchParams(window.location.search);
          params.set('title', value);
          console.log('Navigating to:', `?${params.toString()}`);
          navigate(`?${params.toString()}`);

        }, 300),
        []
      );



    const sortOptions: IndexFiltersProps['sortOptions'] = [
        { label: 'Title', value: 'title asc', directionLabel: 'A-Z' },
        { label: 'Title', value: 'title desc', directionLabel: 'Z-A' },
        { label: 'Price', value: 'price asc', directionLabel: 'Ascending' },
        { label: 'Price', value: 'price desc', directionLabel: 'Descending' },
    ];

    const [sortSelected, setSortSelected] = useState(['title asc']);
    const { mode, setMode } = useSetIndexFiltersMode();

    const [accountStatus, setAccountStatus] = useState<string[] | undefined>(undefined);

    const [queryValue, setQueryValue] = useState('');

    console.log('sortSelected', sortSelected, setSortSelected)





    const handleAccountStatusChange = useCallback((value: string[]) => setAccountStatus(value), []);

    const handleFiltersClearAll = useCallback(() => {
        setAccountStatus(undefined);

        setQueryValue('');
    }, []);

    const filters = [
        {
            key: 'accountStatus',
            label: 'Account status',
            filter: (
                <ChoiceList
                    title="Account status"
                    titleHidden
                    choices={[
                        { label: 'Enabled', value: 'enabled' },
                        { label: 'Not invited', value: 'not invited' },
                        { label: 'Invited', value: 'invited' },
                        { label: 'Declined', value: 'declined' },
                    ]}
                    selected={accountStatus || []}
                    onChange={handleAccountStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },

    ];

    const appliedFilters: IndexFiltersProps['appliedFilters'] = [];


    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(products);

    const rowMarkup = products.map(({ id, title, status, variants }, index) => (
        <IndexTable.Row id={id} key={id} selected={selectedResources.includes(id)} position={index}>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="bold" as="span">
                    {title}
                </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{status}</IndexTable.Cell>
            <IndexTable.Cell>{variants.edges[0]?.node.price || 'N/A'}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <LegacyCard>
            <IndexFilters
                sortOptions={sortOptions}
                sortSelected={sortSelected}
                onSort={handleSortChange}
                queryValue={queryValue}
                queryPlaceholder="Search products"
                onQueryChange={handleFiltersQueryChange}
                onQueryClear={() => setQueryValue('')}

                tabs={tabs}
                selected={selected}
                onSelect={setSelected}
                canCreateNewView
                filters={filters}
                appliedFilters={appliedFilters}
                onClearAll={handleFiltersClearAll}
                mode={mode}
                setMode={setMode}
            />
            <IndexTable
                resourceName={resourceName}
                itemCount={products.length}
                selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: 'Product Name' },
                    { title: 'Status' },
                    { title: 'Price' },
                ]}
            >
                {rowMarkup}
            </IndexTable>
        </LegacyCard>
    );
};

